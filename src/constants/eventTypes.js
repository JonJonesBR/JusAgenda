/**
 * @typedef {Object} TipoDeEvento
 * @property {string} id
 * @property {Object<string, string>} labels
 */

export const eventTypes = {
  audiencia: {
    id: 'hearing',
    labels: {
      'pt-BR': 'Audiência',
      'en-US': 'Hearing',
    },
  },
  reuniao: {
    id: 'meeting',
    labels: {
      'pt-BR': 'Reunião',
      'en-US': 'Meeting',
    },
  },
  prazo: {
    id: 'deadline',
    labels: {
      'pt-BR': 'Prazo',
      'en-US': 'Deadline',
    },
  },
  outros: {
    id: 'other',
    labels: {
      'pt-BR': 'Outros',
      'en-US': 'Others',
    },
  },
};

export const getEventTypeLabel = (type, language = 'pt-BR') => {
  const eventType = Object.values(eventTypes).find((e) => (link unavailable) === type);
  return eventType?.labels[language] || type;
};
