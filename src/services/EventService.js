// Simulando um banco de dados local com alguns compromissos de exemplo
let compromissos = [
  {
    id: '1',
    title: 'Audiência Criminal',
    date: '2025-01-10T14:00:00.000Z',
    location: 'Fórum Central',
    client: 'João Silva',
    type: 'audiencia',
    description: 'Audiência de instrução e julgamento',
    notificationId: null,
    calendarEventId: null,
  },
  {
    id: '2',
    title: 'Reunião com Cliente',
    date: '2025-01-15T10:00:00.000Z',
    location: 'Escritório',
    client: 'Maria Santos',
    type: 'reuniao',
    description: 'Discussão sobre novo caso',
    notificationId: null,
    calendarEventId: null,
  },
  {
    id: '3',
    title: 'Prazo Recursal',
    date: '2025-01-20T23:59:59.000Z',
    location: 'Online',
    client: 'Pedro Oliveira',
    type: 'prazo',
    description: 'Último dia para apresentar recurso',
    notificationId: null,
    calendarEventId: null,
  }
];

// Gera um ID único para novos compromissos
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Retorna todos os compromissos ordenados por data
export const getAllCompromissos = () => {
  return [...compromissos].sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Retorna compromissos futuros ordenados por data
export const getUpcomingCompromissos = () => {
  const now = new Date();
  return compromissos
    .filter(compromisso => new Date(compromisso.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Adiciona um novo compromisso
export const addCompromisso = (compromisso) => {
  try {
    const newCompromisso = {
      ...compromisso,
      id: generateId(),
      notificationId: null,
      calendarEventId: null,
    };
    compromissos.push(newCompromisso);
    return newCompromisso;
  } catch (error) {
    console.error("Erro ao adicionar compromisso:", error.message);
    throw new Error("Não foi possível adicionar o compromisso.");
  }
};

// Atualiza um compromisso existente
export const updateCompromisso = (id, updatedCompromisso) => {
  const index = compromissos.findIndex(compromisso => compromisso.id === id);
  if (index !== -1) {
    compromissos[index] = { 
      ...compromissos[index], 
      ...updatedCompromisso,
      notificationId: compromissos[index].notificationId,
      calendarEventId: compromissos[index].calendarEventId,
    };
    return compromissos[index];
  }
  return null;
};

// Remove um compromisso
export const deleteCompromisso = (id) => {
  const index = compromissos.findIndex(compromisso => compromisso.id === id);
  if (index !== -1) {
    compromissos = compromissos.filter(compromisso => compromisso.id !== id);
    return true;
  }
  return false;
};

// Busca compromissos por texto
export const searchCompromissos = (query) => {
  query = query.toLowerCase();
  return compromissos.filter(compromisso => 
    compromisso.title.toLowerCase().includes(query) ||
    compromisso.client?.toLowerCase().includes(query) ||
    compromisso.description?.toLowerCase().includes(query) ||
    compromisso.location?.toLowerCase().includes(query)
  );
};

// Busca um compromisso específico por ID
export const getCompromissoById = (id) => {
  return compromissos.find(compromisso => compromisso.id === id);
};

// Atualiza os IDs de notificação e calendário
export const updateCompromissoNotifications = (id, { notificationId, calendarEventId }) => {
  const index = compromissos.findIndex(compromisso => compromisso.id === id);
  if (index !== -1) {
    compromissos[index] = {
      ...compromissos[index],
      notificationId: notificationId ?? compromissos[index].notificationId,
      calendarEventId: calendarEventId ?? compromissos[index].calendarEventId,
    };
    return compromissos[index];
  }
  return null;
};
