/**
 * @typedef {Object} EventType
 * @property {string} id Unique identifier for the event type.
 * @property {string} label Label displayed in the interface.
 */

export const eventTypes = {
  audiencia: {
    id: 'hearing',
    label: 'Audiência',
  },
  reuniao: {
    id: 'meeting',
    label: 'Reunião',
  },
  prazo: {
    id: 'deadline',
    label: 'Prazo',
  },
  outros: {
    id: 'other',
    label: 'Outros',
  },
};

/**
 * Retrieves the label for a given event type.
 * @param {string} type Identifier for the event type.
 * @returns {string} The label corresponding to the event type.
 */
export const getEventTypeLabel = (type) => {
  const eventType = Object.values(eventTypes).find((e) => e.id === type);

  if (!eventType) {
    console.warn(`Event type not found: ${type}`);
    return type; // Fallback to the identifier
  }

  return eventType.label; // Always returns the label
};
