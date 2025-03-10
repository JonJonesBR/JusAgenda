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
import NotificationService from '../services/NotificationService';

/**
 * @typedef {Object} Event
 * @property {string} id - Unique identifier
 * @property {string} title - Event title
 * @property {string} type - Event type (audiencia, reuniao, prazo, etc)
 * @property {Date} date - Event date and time
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
 * @property {(eventData: Event) => Promise<void>} addEvent - Add new event
 * @property {(eventData: Event) => Promise<void>} updateEvent - Update existing event
 * @property {(eventId: string) => Promise<void>} deleteEvent - Delete event
 * @property {(term: string) => Event[]} searchEvents - Search events
 * @property {(id: string) => Event|null} getEventById - Get event by ID
 * @property {(event: Event) => Promise<void>} updateEventNotifications - Update event notifications
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
   * @param {boolean} sendEmailFlag - Flag para envio de e-mail de notificação.
   * @returns {Promise<boolean>} True se adicionado com sucesso; caso contrário, false.
   */
  const addEvent = useCallback(
    async (eventData, sendEmailFlag) => {
      setLoading(true);
      setError(null);
      try {
        const newEvent = await addCompromissoService(eventData);
        if (newEvent) {
          triggerUpdate();
          if (sendEmailFlag) {
            await sendEmail(
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
    [triggerUpdate]
  );

  /**
   * Atualiza um evento existente.
   *
   * @param {string} id - Identificador do evento.
   * @param {object} eventData - Novos dados do evento.
   * @param {boolean} sendEmailFlag - Flag para envio de notificação por e-mail.
   * @returns {Promise<boolean>} True se atualizado com sucesso; caso contrário, false.
   */
  const updateEvent = useCallback(
    async (eventData, sendEmailFlag) => {
      setLoading(true);
      setError(null);
      try {
        if (!eventData?.id) {
          throw new Error('ID do evento é obrigatório para atualização');
        }
        const updatedEvent = await updateEventService(eventData.id, eventData);
        if (updatedEvent) {
          triggerUpdate();
          if (sendEmailFlag) {
            await sendEmail(
              'recipient@example.com',
              'Event Updated',
              `The event "${eventData.title}" has been updated.`
            );
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao atualizar evento:', err);
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [triggerUpdate]
  );

  /**
   * Exclui um evento.
   *
   * @param {string} id - Identificador do evento.
   * @param {boolean} sendEmailFlag - Flag para envio de notificação por e-mail.
   * @returns {Promise<boolean>} Resultado da operação.
   */
  const deleteEvent = useCallback(
    async (id, sendEmailFlag) => {
      try {
        const success = await deleteCompromissoService(id);
        if (success) {
          triggerUpdate();
          if (sendEmailFlag) {
            await sendEmail(
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
    [triggerUpdate]
  );
  /**
   * Realiza a busca de eventos com base em um termo e filtros.
   *
   * @param {string} term - Termo de busca.
   * @param {string[]} filters - Lista de tipos de eventos para filtrar.
   * @returns {Promise<Array>} Lista de eventos ordenada por data.
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
   * @returns {Promise<object|null>} Evento correspondente ou null se não encontrado.
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
   * @returns {Promise<object|null>} Evento atualizado ou null em caso de erro.
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

  // Memoriza o valor do contexto para evitar re-renderizações desnecessárias
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

/**
 * Hook para uso do contexto de eventos.
 * @returns {object} Contexto de eventos.
 */
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
