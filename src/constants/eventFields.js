/**
 * @typedef {Object} EventField
 * @property {string} name - Nome do campo.
 * @property {string} label - Rótulo exibido na interface.
 * @property {string} type - Tipo do campo (ex.: text, textarea, select).
 */

// Definição dos campos comuns compartilhados entre os tipos de evento.
const commonFields = {
  title: { name: 'title', label: 'Título', type: 'text' },
  date: { name: 'date', label: 'Data', type: 'date' },
  notes: { name: 'notes', label: 'Observações', type: 'textarea' },
};

/**
 * Mapeamento dos tipos de eventos para seus respectivos campos.
 * @type {Record<string, EventField[]>}
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
 * Adiciona um campo a um tipo específico de evento.
 *
 * @param {string} eventType - Tipo de evento (ex.: audiencia, reuniao).
 * @param {EventField} field - Campo a ser adicionado.
 * @throws {Error} Lança erro se o tipo de evento não existir.
 */
export function addField(eventType, field) {
  if (!eventFields[eventType]) {
    throw new Error(`Event type "${eventType}" does not exist.`);
  }
  eventFields[eventType].push(field);
}
