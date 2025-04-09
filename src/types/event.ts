/**
 * Type definitions for the Event data structure used throughout the application
 */

export interface Event {
  id: string;
  title?: string;
  cliente: string;
  tipo: string;
  data: Date;
  local?: string;
  descricao?: string;
  numeroProcesso?: string;
  competencia?: string;
  vara?: string;
  comarca?: string;
  estado?: string;
  reu?: string;
  telefoneCliente?: string;
  emailCliente?: string;
  telefoneReu?: string;
  emailReu?: string;
  juiz?: string;
  promotor?: string;
  perito?: string;
  prepostoCliente?: string;
  testemunhas?: string;
  documentosNecessarios?: string;
}

export interface EventFormData extends Omit<Event, "id"> {
  id?: string;
}

export interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
  addEvent: (
    eventData: Event,
    sendEmailFlag?: boolean
  ) => Promise<boolean>;
  updateEvent: (eventData: Event | EventFormData, sendEmailFlag?: boolean) => Promise<boolean>;
  deleteEvent: (eventId: string, sendEmailFlag?: boolean) => Promise<boolean>;
  searchEvents: (term: string, filters?: string[]) => Promise<Event[]>;
  getEventById: (id: string) => Promise<Event | null>;
  updateEventNotifications: (
    id: string,
    notificationData: Record<string, unknown>
  ) => Promise<Event | null>;
}
