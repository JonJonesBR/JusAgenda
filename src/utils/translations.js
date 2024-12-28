export const translations = {
  'pt-BR': {
    home: {
      title: 'JusAgenda',
      upcoming: 'Próximos Eventos',
      newEvent: 'Novo Evento',
      search: 'Pesquisar',
    },
    eventTypes: {
      hearing: 'Audiência',
      meeting: 'Reunião',
      deadline: 'Prazo',
      other: 'Outros',
    },
  },
  'en-US': {
    home: {
      title: 'JusAgenda',
      upcoming: 'Upcoming Events',
      newEvent: 'New Event',
      search: 'Search',
    },
    eventTypes: {
      hearing: 'Hearing',
      meeting: 'Meeting',
      deadline: 'Deadline',
      other: 'Others',
    },
  },
};

/**
 * Translates a given key to the specified language.
 * @param {string} language - Language code (e.g., 'pt-BR', 'en-US').
 * @param {string} key - Key to translate (e.g., 'home.title').
 * @returns {string} Translated text.
 */
export const translate = (language, key) => {
  const keys = key.split('.');
  return keys.reduce((obj, k) => obj?.[k], translations[language]) || key;
};
