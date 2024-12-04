// src/utils/translations.js
export const translations = {
    'pt-BR': {
      home: {
        title: 'JusAgenda',
        upcoming: 'Próximos Eventos',
        newEvent: 'Novo Evento',
      },
      eventTypes: {
        hearing: 'Audiência',
        meeting: 'Reunião',
        deadline: 'Prazo',
        other: 'Outros'
      }
    },
    'en-US': {
      home: {
        title: 'JusAgenda',
        upcoming: 'Upcoming Events',
        newEvent: 'New Event',
      },
      eventTypes: {
        hearing: 'Hearing',
        meeting: 'Meeting', 
        deadline: 'Deadline',
        other: 'Others'
      }
    }
  };
  
  export const translate = (language, key) => {
    const keys = key.split('.');
    return keys.reduce((obj, k) => obj[k], translations[language]);
  };