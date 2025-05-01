/**
 * Type definitions for the Event data structure used throughout the application
 */

export interface Event {
  id: string;
  title?: string;
  titulo?: string; // Campo alternativo para título (compatibilidade)
  nome?: string;  // Campo alternativo para título (compatibilidade)
  cliente: string;
  tipo: string;
  data: Date;
  prioridade: "alta" | "media" | "baixa";
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
  observacoes?: string;
  valor?: string;
  honorarios?: string;
  prazoDias?: string;
  fase?: string;
}

export interface EventFormData {
  title?: string;
  cliente: string;
  tipo: string;
  data: Date;
  prioridade: "alta" | "media" | "baixa";
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
  // Updated deleteEvent signature
  deleteEvent: (eventId: string) => Promise<Event | null>;
  // Added new functions for undo logic
  confirmDeleteEvent: () => Promise<boolean>;
  undoDeleteEvent: () => void;
  // Add timer ref type (non-optional as it's always provided by the context)
  deleteTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  searchEvents: (term: string, filters?: string[]) => Promise<Event[]>;
  getEventById: (id: string) => Promise<Event | null>;
  updateEventNotifications: (
    id: string,
    notificationData: Record<string, unknown>
  ) => Promise<Event | null>;
}
