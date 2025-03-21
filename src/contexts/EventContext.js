// EventContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  getAllCompromissos,
  addCompromisso as addCompromissoService,
  updateCompromisso as updateEventService,
  deleteCompromisso as deleteCompromissoService,
  searchCompromissos as searchEventsService,
  getCompromissoById as getEventByIdService,
  updateCompromissoNotifications as updateEventNotificationsService,
} from '../services/EventService';
import * as NotificationService from '../services/notifications';

/**
 * @typedef {Object} Event
 * @property {string} id - Unique identifier
 * @property {string} title - Event title
 * @property {string} type - Event type (audiencia, reuniao, prazo, etc)
 * @property {Date|string} date - Event date and time (pode ser objeto Date ou string ISO)
 * @property {string} [location] - Optional event location
 * @property {string} [description] - Optional event description
 * @property {string} [client] - Optional client name
 */

/**
 * @typedef {Object} EventContextType
 * @property {Event[]} events - List of all events
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {() => Promise<void>} refreshEvents - Refresh events list
 * @property {(eventData: Event, sendEmailFlag?: boolean) => Promise<boolean>} addEvent - Add new event
 * @property {(eventData: Event, sendEmailFlag?: boolean) => Promise<boolean>} updateEvent - Update existing event
 * @property {(eventId: string, sendEmailFlag?: boolean) => Promise<boolean>} deleteEvent - Delete event
 * @property {(term: string, filters?: string[]) => Promise<Event[]>} searchEvents - Search events
 * @property {(id: string) => Promise<Event|null>} getEventById - Get event by ID
 * @property {(id: string, notificationData: object) => Promise<Event|null>} updateEventNotifications - Update event notifications
 */

const EventContext = createContext(null);

/**
 * Provider para gerenciamento de eventos.
 * Realiza operações de CRUD, busca e atualização de notificações.
 */
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Busca e atualiza a lista de eventos de forma assíncrona.
   */
  const refreshEvents = useCallback(async () => {
    try {
      const allEvents = await getAllCompromissos();
      setEvents(allEvents);
    } catch (err) {
      console.error('Erro ao atualizar eventos:', err);
      setError(err.message);
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
    async (eventData, sendEmailFlag = false) => {
      setLoading(true);
      setError(null);
      try {
        // Validação e garantia de que a data seja válida.
        if (
          !eventData.date ||
          !(eventData.date instanceof Date) ||
          isNaN(eventData.date.getTime())
        ) {
          const currentDate = new Date();
          console.warn(
            `[Event ${eventData.id || 'undefined'}] Invalid or missing date field, using current date: ${currentDate.toISOString()}`
          );
          eventData.date = currentDate;
        }
        // Chamada do serviço para adicionar o compromisso.
        const newEvent = await addCompromissoService(eventData);
        if (newEvent) {
          await refreshEvents();
          triggerUpdate();
          if (sendEmailFlag) {
            await NotificationService.sendEmail(
              'recipient@example.com', // Substitua pelo e-mail do destinatário
              'New Event Created',
              `A new event "${eventData.title}" has been created.`
            );
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao adicionar evento:', err);
        setError(err.message);
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
    async (eventData, sendEmailFlag = false) => {
      setLoading(true);
      setError(null);
      try {
        if (!eventData?.id) {
          throw new Error('ID do evento é obrigatório para atualização');
        }
        // Valida e garante que a data seja um objeto Date válido.
        let dateToUse;
        if (eventData.date instanceof Date && !isNaN(eventData.date.getTime())) {
          dateToUse = eventData.date;
        } else if (typeof eventData.date === 'string') {
          const parsedDate = new Date(eventData.date);
          if (!isNaN(parsedDate.getTime())) {
            dateToUse = parsedDate;
          } else {
            console.warn(`[Event ${eventData.id}] Invalid date string: ${eventData.date}`);
            dateToUse = new Date();
          }
        } else {
          console.warn(`[Event ${eventData.id}] Invalid or missing date field`);
          dateToUse = new Date();
        }

        const eventWithDate = {
          ...eventData,
          date: dateToUse,
        };
        const updatedEvent = await updateEventService(eventData.id, eventWithDate);
        if (!updatedEvent) {
          throw new Error('Falha ao atualizar o evento');
        }
        // Atualiza o estado local com o evento atualizado e recarrega a lista.
        setEvents((prevEvents) => {
          const eventIndex = prevEvents.findIndex((e) => e.id === eventData.id);
          if (eventIndex === -1) return prevEvents;
          const newEvents = [...prevEvents];
          newEvents[eventIndex] = updatedEvent;
          return newEvents;
        });
        await refreshEvents();
        triggerUpdate();
        if (sendEmailFlag) {
          await NotificationService.sendEmail(
            'recipient@example.com',
            'Event Updated',
            `The event "${eventData.title}" has been updated.`
          );
        }
        return true;
      } catch (err) {
        console.error('Erro ao atualizar evento:', err);
        setError(err.message);
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
    async (id, sendEmailFlag = false) => {
      try {
        const success = await deleteCompromissoService(id);
        if (success) {
          await refreshEvents();
          triggerUpdate();
          if (sendEmailFlag) {
            await NotificationService.sendEmail(
              'recipient@example.com',
              'Event Deleted',
              'An event has been deleted.'
            );
          }
        }
        return success;
      } catch (err) {
        console.error('Erro ao excluir evento:', err);
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
    async (term, filters) => {
      try {
        let results = term ? await searchEventsService(term) : [...events];
        if (filters?.length > 0) {
          results = results.filter((event) =>
            filters.includes(event.type?.toLowerCase())
          );
        }
        return results.sort((a, b) => new Date(a.date) - new Date(b.date));
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
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
  const getEventById = useCallback(async (id) => {
    try {
      return await getEventByIdService(id);
    } catch (error) {
      console.error('Erro ao obter evento por ID:', error);
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
    async (id, notificationData) => {
      try {
        const updatedEvent = await updateEventNotificationsService(
          id,
          notificationData
        );
        if (updatedEvent) {
          triggerUpdate();
        }
        return updatedEvent;
      } catch (err) {
        console.error('Erro ao atualizar notificações:', err);
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
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
