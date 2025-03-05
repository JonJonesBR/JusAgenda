/**
 * Módulo central para os recursos relacionados a eventos.
 */

/**
 * @typedef {Object} EventType
 * @property {string} id - Identificador único para o tipo de evento.
 * @property {string} label - Rótulo exibido na interface.
 */

/**
 * Coleção dos tipos de eventos.
 * @type {Record<string, EventType>}
 */
export const eventTypes = Object.freeze({
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
});

/**
 * Mapeamento otimizado de id de evento para seu rótulo.
 * @type {Record<string, string>}
 */
const eventTypeLabelMap = Object.freeze(
  Object.fromEntries(
    Object.values(eventTypes).map(e => [e.id, e.label])
  )
);

/**
 * Retorna o rótulo correspondente ao identificador do tipo de evento.
 * @param {string} type - Identificador do tipo de evento.
 * @returns {string} Rótulo do evento ou o próprio identificador se não encontrado.
 */
export const getEventTypeLabel = (type) => {
  const label = eventTypeLabelMap[type];
  if (!label) {
    console.warn(`Tipo de evento não encontrado: ${type}`);
    return type;
  }
  return label;
};

/**
 * @typedef {Object} EventField
 * @property {string} name - Nome do campo.
 * @property {string} label - Rótulo exibido na interface.
 * @property {string} type - Tipo do campo (ex.: text, textarea, select).
 */

// Campos comuns compartilhados entre os tipos de evento
const commonFields = Object.freeze({
  title: { name: 'title', label: 'Título', type: 'text' },
  date: { name: 'date', label: 'Data', type: 'date' },
  notes: { name: 'notes', label: 'Observações', type: 'textarea' },
});

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
 * Esta função muta o objeto eventFields. Use com cautela.
 * @param {string} eventType - Tipo de evento (ex.: audiencia, reuniao).
 * @param {EventField} field - Campo a ser adicionado.
 * @throws {Error} Se o tipo de evento não existir.
 */
export function addField(eventType, field) {
  if (!eventFields[eventType]) {
    throw new Error(`Tipo de evento "${eventType}" não existe.`);
  }
  eventFields[eventType].push(field);
}

/**
 * Rotas da aplicação.
 */
export const ROUTES = Object.freeze({
  EVENT_DETAILS: 'EventDetails',
  // ...outras rotas
});
