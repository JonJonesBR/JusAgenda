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
 * Traduz um texto para o idioma especificado.
 * @param {string} language Código do idioma (pt-BR, en-US, etc.)
 * @param {string} key Chave do texto a ser traduzido (ex: home.title)
 * @returns {string} Texto traduzido
 */
export const translate = (language, key) => {
  const keys = key.split('.');
  return keys.reduce((obj, k) => obj?.[k], translations[language]);
};
