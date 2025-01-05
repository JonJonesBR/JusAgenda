import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAllEvents, addEvent as addEventService, updateEvent as updateEventService, deleteEvent as deleteEventService, searchEvents as searchEventsService, getEventById as getEventByIdService, updateEventNotifications as updateEventNotificationsService } from '../services/EventService';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Carrega os eventos quando o provider é montado ou quando há uma atualização
  useEffect(() => {
    refreshEvents();
  }, [lastUpdate]);

  const refreshEvents = useCallback(() => {
    const allEvents = getAllEvents();
    setEvents(allEvents);
  }, []);

  const triggerUpdate = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  const addEvent = useCallback(async (eventData) => {
    try {
      const newEvent = await addEventService(eventData);
      if (newEvent) {
        triggerUpdate();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      return false;
    }
  }, [triggerUpdate]);

  const updateEvent = useCallback(async (id, eventData) => {
    try {
      const updatedEvent = await updateEventService(id, eventData);
      if (updatedEvent) {
        triggerUpdate();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      return false;
    }
  }, [triggerUpdate]);

  const deleteEvent = useCallback(async (id) => {
    try {
      const success = await deleteEventService(id);
      if (success) {
        triggerUpdate();
      }
      return success;
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      return false;
    }
  }, [triggerUpdate]);

  const searchEvents = useCallback((term, filters) => {
    let results = term ? searchEventsService(term) : [...events];
    if (filters && filters.length > 0) {
      results = results.filter(event => 
        filters.includes(event.type?.toLowerCase())
      );
    }
    return results.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const getEventById = useCallback((id) => {
    return getEventByIdService(id);
  }, []);

  const updateEventNotifications = useCallback(async (id, notificationData) => {
    try {
      const updatedEvent = await updateEventNotificationsService(id, notificationData);
      if (updatedEvent) {
        triggerUpdate();
      }
      return updatedEvent;
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      return null;
    }
  }, [triggerUpdate]);

  const value = {
    events,
    refreshEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    getEventById,
    updateEventNotifications,
  };

  return (
    <EventContext.Provider value={value}>
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
