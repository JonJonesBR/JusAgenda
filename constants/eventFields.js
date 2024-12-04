// src/constants/eventFields.js
export const eventFields = {
    hearing: [
      { name: 'processNumber', label: 'Número do Processo', type: 'text' },
      { name: 'court', label: 'Vara', type: 'text' },
      { name: 'plaintiffParty', label: 'Parte Autora', type: 'text' },
      { name: 'defendantParty', label: 'Parte Ré', type: 'text' },
      { name: 'hearingLocation', label: 'Local da Audiência', type: 'text' },
      { name: 'observations', label: 'Observações', type: 'textarea' }
    ],
    meeting: [
      { name: 'clientName', label: 'Nome do Cliente', type: 'text' },
      { name: 'meetingLocation', label: 'Local da Reunião', type: 'text' },
      { name: 'topic', label: 'Assunto', type: 'text' },
      { name: 'observations', label: 'Observações', type: 'textarea' }
    ],
    deadline: [
      { name: 'processNumber', label: 'Número do Processo', type: 'text' },
      { name: 'court', label: 'Vara', type: 'text' },
      { name: 'deadlineType', label: 'Tipo de Prazo', type: 'select' },
      { name: 'observations', label: 'Observações', type: 'textarea' }
    ]
  };