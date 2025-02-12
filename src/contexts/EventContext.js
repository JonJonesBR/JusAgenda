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
  updateEvent as updateEventService,
  deleteCompromisso as deleteCompromissoService,
  searchEvents as searchEventsService,
  getEventById as getEventByIdService,
  updateEventNotifications as updateEventNotificationsService,
} from '../services/EventService';
import { sendEmail } from '../services/EmailService';

// Criação do contexto para eventos
const EventContext = createContext();

/**
 * Provider para gerenciamento de eventos.
 * Realiza operações de CRUD, busca e atualização de notificações.
 */
export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Atualiza a lista de eventos sempre que lastUpdate mudar
  useEffect(() => {
    refreshEvents();
  }, [lastUpdate]);

  /**
   * Busca e atualiza a lista de eventos.
   * Considera que `getAllCompromissos` é síncrono; se for assíncrono, adapte com async/await.
   */
  const refreshEvents = useCallback(() => {
    const allEvents = getAllCompromissos();
    setEvents(allEvents);
  }, []);

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
   * @returns {Promise<boolean>} True se adicionado com sucesso, caso contrário false.
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
        console.error('Error adding event:', err);
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
   * @returns {Promise<boolean>} True se atualizado com sucesso, caso contrário false.
   */
  const updateEvent = useCallback(
    async (id, eventData, sendEmailFlag) => {
      try {
        const updatedEvent = await updateEventService(id, eventData);
        if (updatedEvent) {
          triggerUpdate();
          if (sendEmailFlag) {
            await sendEmail(
              'recipient@example.com', // Substitua pelo e-mail do destinatário
              'Event Updated',
              `The event "${eventData.title}" has been updated.`
            );
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error updating event:', err);
        return false;
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
              'recipient@example.com', // Substitua pelo e-mail do destinatário
              'Event Deleted',
              `An event has been deleted.`
            );
          }
        }
        return success;
      } catch (err) {
        console.error('Error deleting event:', err);
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
   * @returns {Array} Lista de eventos ordenada por data.
   */
  const searchEvents = useCallback(
    (term, filters) => {
      let results = term ? searchEventsService(term) : [...events];
      if (filters?.length > 0) {
        results = results.filter((event) =>
          filters.includes(event.type?.toLowerCase())
        );
      }
      return results.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    [events]
  );

  /**
   * Obtém um evento pelo seu identificador.
   *
   * @param {string} id - Identificador do evento.
   * @returns {object} Evento correspondente.
   */
  const getEventById = useCallback((id) => getEventByIdService(id), []);

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
        console.error('Error updating notifications:', err);
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
