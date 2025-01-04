// Simulando um banco de dados local com alguns eventos de exemplo
let events = [
  {
    id: '1',
    title: 'Audiência Criminal',
    date: '2025-01-10T14:00:00.000Z',
    location: 'Fórum Central',
    client: 'João Silva',
    type: 'audiencia',
    description: 'Audiência de instrução e julgamento'
  },
  {
    id: '2',
    title: 'Reunião com Cliente',
    date: '2025-01-15T10:00:00.000Z',
    location: 'Escritório',
    client: 'Maria Santos',
    type: 'reuniao',
    description: 'Discussão sobre novo caso'
  },
  {
    id: '3',
    title: 'Prazo Recursal',
    date: '2025-01-20T23:59:59.000Z',
    location: 'Online',
    client: 'Pedro Oliveira',
    type: 'prazo',
    description: 'Último dia para apresentar recurso'
  }
];

// Gera um ID único para novos eventos
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Retorna todos os eventos ordenados por data
export const getAllEvents = () => {
  return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Retorna eventos futuros ordenados por data
export const getUpcomingEvents = () => {
  const now = new Date();
  return events
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Adiciona um novo evento
export const addEvent = (event) => {
  const newEvent = {
    ...event,
    id: generateId(),
  };
  events.push(newEvent);
  return newEvent;
};

// Atualiza um evento existente
export const updateEvent = (id, updatedEvent) => {
  const index = events.findIndex(event => event.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent };
    return events[index];
  }
  return null;
};

// Remove um evento
export const deleteEvent = (id) => {
  const index = events.findIndex(event => event.id === id);
  if (index !== -1) {
    events = events.filter(event => event.id !== id);
    return true;
  }
  return false;
};

// Busca eventos por texto
export const searchEvents = (query) => {
  query = query.toLowerCase();
  return events.filter(event => 
    event.title.toLowerCase().includes(query) ||
    event.client?.toLowerCase().includes(query) ||
    event.description?.toLowerCase().includes(query) ||
    event.location?.toLowerCase().includes(query)
  );
};

// Busca um evento específico por ID
export const getEventById = (id) => {
  return events.find(event => event.id === id);
};
