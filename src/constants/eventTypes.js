/**
 * @typedef {Object} EventType
 * @property {string} id - Identificador único para o tipo de evento.
 * @property {string} label - Rótulo exibido na interface.
 */

/**
 * Coleção dos tipos de eventos.
 * @type {Record<string, EventType>}
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
 * Retorna o rótulo correspondente a um identificador de tipo de evento.
 *
 * @param {string} type - Identificador do tipo de evento.
 * @returns {string} O rótulo correspondente ou o próprio identificador caso não seja encontrado.
 */
export const getEventTypeLabel = (type) => {
  const eventType = Object.values(eventTypes).find((e) => e.id === type);
  if (!eventType) {
    console.warn(`Event type not found: ${type}`);
    return type;
  }
  return eventType.label;
};
