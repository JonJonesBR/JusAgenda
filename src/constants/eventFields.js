/**
 * @typedef {Object} EventField
 * @property {string} name Field name.
 * @property {string} label Label displayed in the interface.
 * @property {string} type Field type (e.g., text, textarea, select).
 */

const commonFields = {
  caseNumber: { name: 'caseNumber', label: 'Número do Processo', type: 'text' },
  court: { name: 'court', label: 'Vara', type: 'text' },
  notes: { name: 'notes', label: 'Observações', type: 'textarea' },
};

/**
 * @type {Object<string, EventField[]>}
 */
export const eventFields = {
  audiencia: [
    commonFields.caseNumber,
    commonFields.court,
    { name: 'plaintiff', label: 'Parte Autora', type: 'text' },
    { name: 'defendant', label: 'Parte Ré', type: 'text' },
    { name: 'hearingLocation', label: 'Local da Audiência', type: 'text' },
    commonFields.notes,
  ],
  reuniao: [
    { name: 'clientName', label: 'Nome do Cliente', type: 'text' },
    { name: 'meetingLocation', label: 'Local da Reunião', type: 'text' },
    { name: 'topic', label: 'Assunto', type: 'text' },
    commonFields.notes,
  ],
  prazo: [
    commonFields.caseNumber,
    commonFields.court,
    { name: 'deadlineType', label: 'Tipo de Prazo', type: 'select' },
    commonFields.notes,
  ],
};

/**
 * Adds a field to a specific event type.
 * @param {string} eventType Type of event (e.g., audiencia, reuniao).
 * @param {EventField} field Field to be added.
 */
export function addField(eventType, field) {
  eventFields[eventType].push(field);
}
