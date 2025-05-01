// EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef, // Import useRef
} from "react";
import {
  getAllCompromissos,
  addCompromisso as addCompromissoService,
  updateCompromisso as updateEventService,
  deleteCompromisso as deleteCompromissoService,
  searchCompromissos as searchEventsService,
  getCompromissoById as getEventByIdService,
  updateCompromissoNotifications as updateEventNotificationsService,
} from "../services/EventService";
import * as NotificationService from "../services/notifications";
import { Event, EventContextType, EventFormData } from "../types/event";

const EventContext = createContext<EventContextType | null>(null);

/**
 * Provider para gerenciamento de eventos.
 * Realiza operações de CRUD, busca e atualização de notificações.
 */
export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<Event | null>(null); // State for event pending deletion
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref for the delete confirmation timer

  /**
   * Busca e atualiza a lista de eventos de forma assíncrona.
   */
  const refreshEvents = useCallback(async () => {
    try {
      const allEvents = await getAllCompromissos();
      setEvents(allEvents);
    } catch (err: unknown) {
      console.error("Erro ao atualizar eventos:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao atualizar evento");
      }
    }
  }, []);

  useEffect(() => {
    refreshEvents();
  }, [lastUpdate, refreshEvents]);

  /**
   * Força a atualização dos eventos.
   */
  const triggerUpdate = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  /**
   * Adiciona um novo evento.
   *
   * @param {object} eventData - Dados do evento.
   * @param {boolean} [sendEmailFlag] - Flag para envio de e-mail de notificação.
   * @returns {Promise<boolean>} True se adicionado com sucesso; caso contrário, false.
   */
  const addEvent = useCallback(
    async (eventData: Event, sendEmailFlag = false) => {
      setLoading(true);
      setError(null);
      try {
        // Validação e garantia de que a data seja válida.
        if (
          !eventData.data ||
          !(eventData.data instanceof Date) ||
          isNaN((eventData.data as Date).getTime())
        ) {
          const currentDate = new Date();
          console.warn(
            `[Event ${
              eventData.id || "undefined"
            }] Invalid or missing date field, using current date: ${currentDate.toISOString()}`
          );
          eventData.data = currentDate;
        }
        // Chamada do serviço para adicionar o compromisso.
        const newEvent = await addCompromissoService(eventData);
        if (newEvent) {
          await refreshEvents();
          triggerUpdate();
          if (sendEmailFlag) {
            await NotificationService.sendEmail(
              "recipient@example.com", // Substitua pelo e-mail do destinatário
              "New Event Created",
              `A new event "${eventData.title}" has been created.`
            );
          }
          return true;
        }
        return false;
      } catch (err: unknown) {
        console.error("Erro ao adicionar evento:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro desconhecido ao atualizar evento");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [triggerUpdate, refreshEvents]
  );

  /**
   * Atualiza um evento existente.
   *
   * @param {object} eventData - Novos dados do evento.
   * @param {boolean} [sendEmailFlag] - Flag para envio de notificação por e-mail.
   * @returns {Promise<boolean>} True se atualizado com sucesso; caso contrário, false.
   */
  const updateEvent = useCallback(
    async (eventData: Event | EventFormData & { id?: string }, sendEmailFlag: boolean = false): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        if (!eventData?.id) {
          throw new Error("ID do evento é obrigatório para atualização");
        }
        // Valida e garante que a data seja um objeto Date válido.
        let dateToUse;
        if (
          eventData.data instanceof Date &&
          !isNaN(eventData.data.getTime())
        ) {
          dateToUse = eventData.data;
        } else if (typeof eventData.data === "string") {
          const parsedDate = new Date(eventData.data);
          if (!isNaN(parsedDate.getTime())) {
            dateToUse = parsedDate;
          } else {
            console.warn(
              `[Event ${eventData.id}] Invalid date string: ${eventData.data}`
            );
            dateToUse = new Date();
          }
        } else {
          console.warn(`[Event ${eventData.id}] Invalid or missing date field`);
          dateToUse = new Date();
        }

        const eventWithDate = {
          ...eventData,
          data: dateToUse,
        };

        // Implementa cache otimista: atualiza o estado local imediatamente
        const optimisticEvent = { ...eventWithDate, id: eventData.id };
        setEvents((prevEvents) => {
          const updatedEvents = prevEvents.map((event) =>
            event.id === optimisticEvent.id ? optimisticEvent : event
          );
          return updatedEvents;
        });

        // Tenta atualizar no servidor
        const updatedEvent = await updateEventService(
          eventData.id,
          eventWithDate
        );
        if (!updatedEvent) {
          // Se falhar, reverte a atualização local
          setEvents((prevEvents) => {
            const originalEvent = prevEvents.find((e) => e.id === eventData.id);
            if (originalEvent) {
              return prevEvents.map((event) =>
                event.id === eventData.id ? originalEvent : event
              );
            }
            return prevEvents;
          });
          throw new Error("Falha ao atualizar o evento");
        }

        // Força a atualização do contexto para todas as telas
        triggerUpdate();

        // Atualiza os dados do servidor em segundo plano para garantir sincronização
        refreshEvents().catch((error) => {
          console.error("Erro ao atualizar eventos do servidor:", error);
        });

        if (sendEmailFlag) {
          await NotificationService.sendEmail(
            "recipient@example.com",
            "Event Updated",
            `The event "${eventData.title}" has been updated.`
          );
        }
        return true;
      } catch (err) {
        if (err instanceof Error) {
          console.error("Erro ao atualizar evento:", err.message);
          setError(err.message || "Erro desconhecido ao atualizar evento");
        } else {
          console.error("Erro ao atualizar evento:", err);
          setError("Erro desconhecido ao atualizar evento");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [triggerUpdate, refreshEvents]
  );

  /**
   * Exclui um evento.
   *
   * @param {string} id - Identificador do evento.
   * @param {boolean} [sendEmailFlag] - Flag para envio de notificação por e-mail.
   * @returns {Promise<Event | null>} O evento excluído temporariamente ou null se não encontrado/erro.
   */
  const deleteEvent = useCallback(
    async (id: string): Promise<Event | null> => {
      // Clear any existing delete timer
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
      // If there's an event already pending deletion, confirm it first
      if (pendingDeleteEvent) {
        try {
          await deleteCompromissoService(pendingDeleteEvent.id);
        } catch (err) {
          console.error("Erro ao confirmar exclusão anterior:", err);
          // Optionally show an error message to the user
        }
        setPendingDeleteEvent(null); // Clear the previously pending event
      }

      const eventToDelete = events.find((event) => event.id === id);
      if (!eventToDelete) {
        console.error("Evento não encontrado para exclusão:", id);
        setError("Evento não encontrado para exclusão.");
        return null;
      }

      // Optimistic update: remove from local state
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      setPendingDeleteEvent(eventToDelete); // Store the event for potential undo

      // Return the deleted event so the UI can show the undo message
      return eventToDelete;
    },
    [events, pendingDeleteEvent] // Removed triggerUpdate and refreshEvents, handled by confirm/undo
  );

  /**
   * Confirma a exclusão do evento que está pendente.
   * @returns {Promise<boolean>} True se a exclusão foi confirmada com sucesso, false caso contrário.
   */
  const confirmDeleteEvent = useCallback(async (): Promise<boolean> => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

    if (!pendingDeleteEvent) {
      console.log("Nenhum evento pendente para confirmar exclusão.");
      return false; // Or true, depending on desired behavior when called without a pending event
    }

    const idToDelete = pendingDeleteEvent.id;
    setPendingDeleteEvent(null); // Clear pending state immediately

    try {
      setLoading(true);
      const success = await deleteCompromissoService(idToDelete);
      if (success) {
        console.log(`Evento ${idToDelete} excluído permanentemente.`);
        // Optionally trigger a full refresh if needed, though optimistic update might suffice
        // await refreshEvents();
        triggerUpdate(); // Ensure UI reflects the change if not using refreshEvents
        return true;
      } else {
        console.error(`Falha ao excluir evento ${idToDelete} do serviço.`);
        setError("Falha ao confirmar a exclusão do evento.");
        // Attempt to restore the event locally if service deletion failed
        const eventToRestore = events.find(e => e.id === idToDelete); // Check if it was somehow added back
        if (!eventToRestore && pendingDeleteEvent) { // Use the original pending event data if needed
             setEvents(prev => [...prev, pendingDeleteEvent]);
             triggerUpdate();
        }
        return false;
      }
    } catch (err) {
      console.error("Erro ao confirmar exclusão do evento:", err);
       if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro desconhecido ao confirmar exclusão");
        }
       // Attempt to restore the event locally on error
       const eventToRestore = events.find(e => e.id === idToDelete);
       if (!eventToRestore && pendingDeleteEvent) {
            setEvents(prev => [...prev, pendingDeleteEvent]);
            triggerUpdate();
       }
      return false;
    } finally {
      setLoading(false);
    }
  }, [pendingDeleteEvent, triggerUpdate, events]); // Added events dependency

  /**
   * Desfaz a exclusão do evento pendente.
   */
  const undoDeleteEvent = useCallback(() => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

    if (pendingDeleteEvent) {
      setEvents((prevEvents) => {
        // Add the event back and sort to maintain order (optional but good practice)
        const restoredEvents = [...prevEvents, pendingDeleteEvent];
        restoredEvents.sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
        );
        return restoredEvents;
      });
      console.log(`Exclusão do evento ${pendingDeleteEvent.id} desfeita.`);
      setPendingDeleteEvent(null);
      triggerUpdate(); // Ensure UI updates
    } else {
      console.log("Nenhum evento pendente para desfazer exclusão.");
    }
  }, [pendingDeleteEvent, triggerUpdate]);

  /**
   * Realiza a busca de eventos com base em um termo e filtros.
   *
   * @param {string} term - Termo de busca.
   * @param {string[]} [filters] - Lista de tipos de eventos para filtrar.
   * @returns {Promise<Event[]>} Lista de eventos ordenada por data.
   */
  const searchEvents = useCallback(
    async (term: string, filters?: string[]): Promise<Event[]> => {
      try {
        let results = term ? await searchEventsService(term) : [...events];
        if (filters && filters.length > 0) {
          results = results.filter((event) =>
            filters.includes(event.type?.toLowerCase() || "")
          );
        }
        return results.sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        return [];
      }
    },
    [events]
  );

  /**
   * Obtém um evento pelo seu identificador.
   *
   * @param {string} id - Identificador do evento.
   * @returns {Promise<Event|null>} Evento correspondente ou null se não encontrado.
   */
  const getEventById = useCallback(async (id: string): Promise<Event | null> => {
    try {
      const result = await getEventByIdService(id);
      if (!result) return null;
      // Forçar a tipagem para Event (idealmente adaptar se necessário)
      return result as Event;
    } catch (error) {
      console.error("Erro ao obter evento por ID:", error);
      return null;
    }
  }, []);

  /**
   * Atualiza as notificações associadas a um evento.
   *
   * @param {string} id - Identificador do evento.
   * @param {object} notificationData - Dados da notificação.
   * @returns {Promise<Event|null>} Evento atualizado ou null em caso de erro.
   */
  const updateEventNotifications = useCallback(
    async (id: string, notificationData: Record<string, unknown>): Promise<Event | null> => {
      try {
        const updatedEvent = await updateEventNotificationsService(
          id,
          notificationData
        );
        if (updatedEvent) {
          triggerUpdate();
          return updatedEvent as Event;
        }
        return null;
      } catch (err) {
        console.error("Erro ao atualizar notificações:", err);
        return null;
      }
    },
    [triggerUpdate]
  );

  const providerValue = useMemo(
    () => ({
      events,
      loading,
      error,
      refreshEvents,
      addEvent,
      updateEvent,
      deleteEvent,
      searchEvents,
      getEventById,
      updateEventNotifications,
      confirmDeleteEvent, // Add new functions to context value
      undoDeleteEvent,    // Add new functions to context value
      deleteTimerRef,     // Expose timer ref if needed by UI (optional)
      pendingDeleteEvent, // Expose pending event if needed (optional)
    }),
    [
      events,
      loading,
      error,
      refreshEvents,
      addEvent,
      updateEvent,
      deleteEvent, // Keep original deleteEvent here
      searchEvents,
      getEventById,
      updateEventNotifications,
      confirmDeleteEvent, // Add dependencies
      undoDeleteEvent,    // Add dependencies
      pendingDeleteEvent, // Add dependency
    ]
  );

  return (
    <EventContext.Provider value={providerValue}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};
