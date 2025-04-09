// EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
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

// Criando um tipo para mapear entre as propriedades da interface Event e as propriedades usadas nos componentes
type EventAdapter = {
  id: string;
  title: string;
  type: string;
  date: Date | string;
  location?: string;
  description?: string;
  client?: string;
};

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

  /**
   * Busca e atualiza a lista de eventos de forma assíncrona.
   */
  // Função para converter do formato do serviço para o formato da interface Event
  const adaptToEventInterface = useCallback((eventData: EventAdapter): Event => {
    const rawDate = (eventData as any).date || (eventData as any).data;
    let parsedDate = new Date(rawDate as string);
    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
      parsedDate = new Date();
    }

    return {
      id: eventData.id,
      title: eventData.title,
      cliente: eventData.client || '',
      tipo: eventData.type || '',
      data: parsedDate,
      local: eventData.location || '',
      descricao: eventData.description || '',
      numeroProcesso: '',
      competencia: '',
      vara: '',
      comarca: '',
      estado: '',
      reu: '',
      telefoneCliente: '',
      emailCliente: '',
      telefoneReu: '',
      emailReu: '',
      juiz: '',
      promotor: '',
      perito: '',
      prepostoCliente: '',
      testemunhas: '',
      documentosNecessarios: '',
    };
  }, []);

  // Função para converter do formato da interface Event para o formato usado nos componentes
  const adaptFromEventInterface = useCallback((event: Event): EventAdapter => {
    return {
      id: event.id,
      title: event.title || '',
      type: event.tipo,
      date: event.data,
      location: event.local,
      description: event.descricao,
      client: event.cliente,
    };
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      const allEvents = await getAllCompromissos();
      // Adaptar os eventos recebidos para o formato da interface Event
      const adaptedEvents = allEvents.map((e) => {
        const event = adaptToEventInterface(e);
        console.log("Adapted event:", event.id, typeof event.data, event.data, typeof (event as any).date, (event as any).date);
        return event;
      });
      setEvents(adaptedEvents);
    } catch (err: unknown) {
      console.error("Erro ao atualizar eventos:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao atualizar evento");
      }
    }
  }, [adaptToEventInterface]);

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
        // Converter do formato da interface Event para o formato usado nos serviços
        const adaptedEventData = adaptFromEventInterface(eventData);
        
        // Validação e garantia de que a data seja válida.
        if (
          !adaptedEventData.date ||
          !(adaptedEventData.date instanceof Date) ||
          isNaN((adaptedEventData.date as Date).getTime())
        ) {
          const currentDate = new Date();
          console.warn(
            `[Event ${
              adaptedEventData.id || "undefined"
            }] Invalid or missing date field, using current date: ${currentDate.toISOString()}`
          );
          adaptedEventData.date = currentDate;
        }
        // Chamada do serviço para adicionar o compromisso.
        const newEvent = await addCompromissoService(adaptedEventData);
        if (newEvent) {
          await refreshEvents();
          triggerUpdate();
          if (sendEmailFlag) {
            await NotificationService.sendEmail(
              "recipient@example.com", // Substitua pelo e-mail do destinatário
              "New Event Created",
              `A new event "${adaptedEventData.title}" has been created.`
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
    [triggerUpdate, refreshEvents, adaptFromEventInterface]
  );

  /**
   * Atualiza um evento existente.
   *
   * @param {object} eventData - Novos dados do evento.
   * @param {boolean} [sendEmailFlag] - Flag para envio de notificação por e-mail.
   * @returns {Promise<boolean>} True se atualizado com sucesso; caso contrário, false.
   */
  const updateEvent = useCallback(
    async (eventData: Event | EventFormData, sendEmailFlag: boolean = false): Promise<boolean> => {
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
   * @returns {Promise<boolean>} Resultado da operação.
   */
  const deleteEvent = useCallback(
    async (id: string, sendEmailFlag: boolean = false): Promise<boolean> => {
      try {
        const success = await deleteCompromissoService(id);
        if (success) {
          await refreshEvents();
          triggerUpdate();
          if (sendEmailFlag) {
            await NotificationService.sendEmail(
              "recipient@example.com",
              "Event Deleted",
              "An event has been deleted."
            );
          }
        }
        return success;
      } catch (err) {
        console.error("Erro ao excluir evento:", err);
        return false;
      }
    },
    [triggerUpdate, refreshEvents]
  );

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
    }),
    [
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
