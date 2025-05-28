import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Event, Contact } from '../types/event'; // Adicionado comentário para ESLint

interface EventCrudContextType {
  events: Event[];
  addEvent: (eventData: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  getEventsByDate: (dateString: string) => Event[];
  getEventById: (eventId: string) => Event | undefined;
}

const EventCrudContext = createContext<EventCrudContextType | undefined>(undefined);

interface EventCrudProviderProps {
  children: ReactNode;
}

export const EventCrudProvider: React.FC<EventCrudProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const addEvent = useCallback((eventData: Omit<Event, 'id'>) => {
    if (eventData.data && eventData.data instanceof Date) {
      console.warn("EventCrudContext.addEvent: event.data deve ser uma string 'YYYY-MM-DD'.");
      // Idealmente, a conversão ocorre antes desta função ser chamada.
      // Exemplo de conversão, se absolutamente necessário aqui:
      // eventData.data = eventData.data.toISOString().split('T')[0];
    }

    const newEvent: Event = {
      id: uuidv4(),
      ...eventData,
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  }, []);

  const updateEvent = useCallback((updatedEvent: Event) => {
    if (updatedEvent.data && updatedEvent.data instanceof Date) {
      console.warn("EventCrudContext.updateEvent: event.data deve ser uma string 'YYYY-MM-DD'.");
      // updatedEvent.data = updatedEvent.data.toISOString().split('T')[0];
    }
    setEvents(prevEvents =>
      prevEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  }, []);

  const getEventsByDate = useCallback(
    (dateString: string) => {
      return events.filter(event => {
        if (typeof event.data === 'string') {
          return event.data === dateString;
        }
        return false;
      });
    },
    [events]
  );

  const getEventById = useCallback(
    (eventId: string) => {
      return events.find(event => event.id === eventId);
    },
    [events]
  );

  return (
    <EventCrudContext.Provider
      value={{ events, addEvent, updateEvent, deleteEvent, getEventsByDate, getEventById }}
    >
      {children}
    </EventCrudContext.Provider>
  );
};

export const useEvents = (): EventCrudContextType => {
  const context = useContext(EventCrudContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventCrudProvider');
  }
  return context;
};
