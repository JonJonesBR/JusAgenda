import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Contact } from '../types/event'; // Import Contact type

// Define the Event type
export interface Event {
  id: string;
  title: string; // Used in HomeScreen, SearchScreen, EmailSyncScreen
  date: string; // Stored as YYYY-MM-DD string, used in HomeScreen, UnifiedCalendarScreen, SearchScreen, EmailSyncScreen
  hora?: string; // Add field for time string
  description?: string; // Used in HomeScreen, SearchScreen, EmailService (sync)
  // Added properties based on usage in ExportScreen and EventDetailsScreen FormData
  type?: string; // Used in ExportScreen, EventViewScreen, EventDetailsScreen (as tipo)
  cliente?: string; // Used in EventDetailsScreen, EventViewScreen, SearchScreen
  local?: string; // Used in EventDetailsScreen, EventViewScreen, SearchScreen
  observacoes?: string; // Used in EventDetailsScreen, EventViewScreen
  numeroProcesso?: string; // Used in EventDetailsScreen, EventViewScreen
  competencia?: string; // Used in EventDetailsScreen, EventViewScreen
  vara?: string; // Used in EventDetailsScreen, EventViewScreen
  comarca?: string; // Used in EventDetailsScreen, EventViewScreen
  estado?: string; // Used in EventDetailsScreen, EventViewScreen
  reu?: string; // Used in EventDetailsScreen, EventViewScreen
  telefoneCliente?: string; // Used in EventDetailsScreen, EventViewScreen
  emailCliente?: string; // Used in EventDetailsScreen, EventViewScreen
  telefoneReu?: string; // Used in EventDetailsScreen, EventViewScreen
  emailReu?: string; // Used in EventDetailsScreen, EventViewScreen
  juiz?: string; // Used in EventDetailsScreen, EventViewScreen
  promotor?: string; // Used in EventDetailsScreen, EventViewScreen
  perito?: string; // Used in EventDetailsScreen, EventViewScreen
  prepostoCliente?: string; // Used in EventDetailsScreen, EventViewScreen
  testemunhas?: string; // Used in EventDetailsScreen, EventViewScreen
  documentosNecessarios?: string; // Used in EventDetailsScreen, EventViewScreen
  valor?: string; // Used in EventDetailsScreen, EventViewScreen
  honorarios?: string; // Used in EventDetailsScreen, EventViewScreen
  prazoDias?: string; // Used in EventDetailsScreen, EventViewScreen
  fase?: string; // Used in EventDetailsScreen, EventViewScreen
  prioridade?: string; // Used in EventDetailsScreen, EventViewScreen, EventViewScreen (badge color)
  presencaObrigatoria?: boolean; // Added from EventDetailsScreen
  // Note: 'data' and 'titulo' were used in old code but replaced by 'date' (string) and 'title'.
  // Note: 'description' and 'descricao' seem to be used for the same purpose. Sticking with 'description'.
  // Note: 'local' and 'location' seem to be used for the same purpose. Sticking with 'local'.
  lembretes?: string[]; // Added from EventDetailsScreen
  contatos?: Contact[]; // Added from EventDetailsScreen
}

// Define the context type
interface EventCrudContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  getEventsByDate: (date: string) => Event[];
  getEventById: (eventId: string) => Event | undefined;
}

// Create the context
const EventCrudContext = createContext<EventCrudContextType | undefined>(undefined);

// Create the provider component
interface EventCrudProviderProps {
  children: ReactNode;
}

export const EventCrudProvider: React.FC<EventCrudProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const addEvent = useCallback((eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More robust ID
      ...eventData,
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  }, []);

  const updateEvent = useCallback((updatedEvent: Event) => {
    setEvents(prevEvents =>
      prevEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  }, []);

  const getEventsByDate = useCallback(
    (date: string) => {
      return events.filter(event => event.date === date);
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

// Create the custom hook to use the context
export const useEvents = (): EventCrudContextType => {
  const context = useContext(EventCrudContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventCrudProvider');
  }
  return context;
};
