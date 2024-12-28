/**
 * @typedef {Object} EventField
 * @property {string} name Field name.
 * @property {string} label Label displayed in the interface.
 * @property {string} type Field type (e.g., text, textarea, select).
 */

const commonFields = {
  title: { name: 'title', label: 'Título', type: 'text' },
  date: { name: 'date', label: 'Data', type: 'date' },
  notes: { name: 'notes', label: 'Observações', type: 'textarea' },
};

/**
 * @type {Object<string, EventField[]>}
 */
export const eventFields = {
  audiencia: [
    commonFields.title,
    commonFields.date,
    { name: 'court', label: 'Vara', type: 'text' },
    commonFields.notes,
  ],
  reuniao: [
    commonFields.title,
    commonFields.date,
    { name: 'client', label: 'Cliente', type: 'text' },
    { name: 'topic', label: 'Assunto', type: 'text' },
    commonFields.notes,
  ],
  prazo: [
    commonFields.title,
    commonFields.date,
    { name: 'deadlineType', label: 'Tipo de Prazo', type: 'select' },
    commonFields.notes,
  ],
  outros: [commonFields.title, commonFields.date, commonFields.notes],
};

/**
 * Adds a field to a specific event type.
 * @param {string} eventType Type of event (e.g., audiencia, reuniao).
 * @param {EventField} field Field to be added.
 */
export function addField(eventType, field) {
  eventFields[eventType].push(field);
}
