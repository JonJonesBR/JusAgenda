/**
 * Central module for event-related resources.
 */

export interface EventType {
  id: string;
  label: string;
}

export interface EventField {
  name: string;
  label: string;
  type: string; // e.g., 'text', 'textarea', 'select', 'date'
}

export const eventTypes: Record<string, EventType> = {
  audiencia: {
    id: "hearing",
    label: "Audiência",
  },
  reuniao: {
    id: "meeting",
    label: "Reunião",
  },
  prazo: {
    id: "deadline",
    label: "Prazo",
  },
  outros: {
    id: "other",
    label: "Outros",
  },
};

const eventTypeLabelMap: Record<string, string> = Object.fromEntries(
  Object.values(eventTypes).map((e) => [e.id, e.label])
);

export function getEventTypeLabel(type: string): string {
  const label = eventTypeLabelMap[type];
  if (!label) {
    console.warn(`Tipo de evento não encontrado: ${type}`);
    return type;
  }
  return label;
}

const commonFields: Record<string, EventField> = {
  title: { name: "title", label: "Título", type: "text" },
  date: { name: "date", label: "Data", type: "date" },
  notes: { name: "notes", label: "Observações", type: "textarea" },
};

export const eventFields: Record<string, EventField[]> = {
  audiencia: [
    commonFields.title,
    commonFields.date,
    { name: "court", label: "Vara", type: "text" },
    commonFields.notes,
  ],
  reuniao: [
    commonFields.title,
    commonFields.date,
    { name: "client", label: "Cliente", type: "text" },
    { name: "topic", label: "Assunto", type: "text" },
    commonFields.notes,
  ],
  prazo: [
    commonFields.title,
    commonFields.date,
    { name: "deadlineType", label: "Tipo de Prazo", type: "select" },
    commonFields.notes,
  ],
  outros: [commonFields.title, commonFields.date, commonFields.notes],
};

export function addField(eventType: string, field: EventField): void {
  if (!eventFields[eventType]) {
    throw new Error(`Tipo de evento "${eventType}" não existe.`);
  }
  eventFields[eventType].push(field);
}

export const ROUTES = {
  EVENT_DETAILS: "EventDetails",
  // ...outras rotas
} as const;

export const PRIORIDADES = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAIXA: 'baixa'
} as const;
