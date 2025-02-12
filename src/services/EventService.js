import { generateId, EVENT_TYPES } from '../utils/common';

// Simula um banco de dados local com alguns compromissos de exemplo.
let compromissos = [
  {
    id: generateId(),
    title: 'Audiência Criminal',
    date: '2025-01-10T14:00:00.000Z',
    location: 'Fórum Central',
    client: 'João Silva',
    type: EVENT_TYPES.AUDIENCIA,
    description: 'Audiência de instrução e julgamento',
    notificationId: null,
    calendarEventId: null,
  },
  {
    id: generateId(),
    title: 'Reunião com Cliente',
    date: '2025-01-15T10:00:00.000Z',
    location: 'Escritório',
    client: 'Maria Santos',
    type: EVENT_TYPES.REUNIAO,
    description: 'Discussão sobre novo caso',
    notificationId: null,
    calendarEventId: null,
  },
  {
    id: generateId(),
    title: 'Prazo Recursal',
    date: '2025-01-20T23:59:59.000Z',
    location: 'Online',
    client: 'Pedro Oliveira',
    type: EVENT_TYPES.PRAZO,
    description: 'Último dia para apresentar recurso',
    notificationId: null,
    calendarEventId: null,
  }
];

/**
 * Retorna todos os compromissos ordenados por data.
 * @returns {Array} Lista ordenada de compromissos.
 */
export const getAllCompromissos = () => {
  return [...compromissos].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

/**
 * Retorna os compromissos futuros ordenados por data.
 * @returns {Array} Lista ordenada de compromissos futuros.
 */
export const getUpcomingCompromissos = () => {
  const now = new Date();
  return compromissos
    .filter((compromisso) => new Date(compromisso.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Adiciona um novo compromisso.
 * @param {Object} compromisso - Dados do compromisso.
 * @returns {Object} O compromisso adicionado.
 * @throws {Error} Se não for possível adicionar o compromisso.
 */
export const addCompromisso = (compromisso) => {
  try {
    const newCompromisso = {
      ...compromisso,
      id: generateId(),
      notificationId: null,
      calendarEventId: null,
    };
    compromissos = [...compromissos, newCompromisso];
    return newCompromisso;
  } catch (error) {
    console.error("Erro ao adicionar compromisso:", error.message);
    throw new Error("Não foi possível adicionar o compromisso.");
  }
};

/**
 * Atualiza um compromisso existente.
 * @param {string} id - ID do compromisso.
 * @param {Object} updatedCompromisso - Dados atualizados do compromisso.
 * @returns {Object|null} O compromisso atualizado ou null se não encontrado.
 */
export const updateCompromisso = (id, updatedCompromisso) => {
  compromissos = compromissos.map((compromisso) =>
    compromisso.id === id
      ? { ...compromisso, ...updatedCompromisso }
      : compromisso
  );
  return compromissos.find((compromisso) => compromisso.id === id) || null;
};

/**
 * Remove um compromisso.
 * @param {string} id - ID do compromisso.
 * @returns {boolean} True se a remoção for bem-sucedida, false caso contrário.
 */
export const deleteCompromisso = (id) => {
  const exists = compromissos.some((compromisso) => compromisso.id === id);
  if (exists) {
    compromissos = compromissos.filter(
      (compromisso) => compromisso.id !== id
    );
    return true;
  }
  return false;
};

/**
 * Busca compromissos que correspondam à consulta de texto.
 * @param {string} query - Texto para busca.
 * @returns {Array} Lista de compromissos que correspondem à consulta.
 */
export const searchCompromissos = (query) => {
  const lowerQuery = query.toLowerCase();
  return compromissos.filter(
    (compromisso) =>
      compromisso.title.toLowerCase().includes(lowerQuery) ||
      compromisso.client?.toLowerCase().includes(lowerQuery) ||
      compromisso.description?.toLowerCase().includes(lowerQuery) ||
      compromisso.location?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Retorna um compromisso específico pelo ID.
 * @param {string} id - ID do compromisso.
 * @returns {Object|undefined} O compromisso ou undefined se não encontrado.
 */
export const getCompromissoById = (id) => {
  return compromissos.find((compromisso) => compromisso.id === id);
};

/**
 * Atualiza os IDs de notificação e calendário de um compromisso.
 * @param {string} id - ID do compromisso.
 * @param {Object} ids - Objeto contendo notificationId e/ou calendarEventId.
 * @returns {Object|null} O compromisso atualizado ou null se não encontrado.
 */
export const updateCompromissoNotifications = (id, { notificationId, calendarEventId }) => {
  compromissos = compromissos.map((compromisso) =>
    compromisso.id === id
      ? {
          ...compromisso,
          notificationId: notificationId ?? compromisso.notificationId,
          calendarEventId: calendarEventId ?? compromisso.calendarEventId,
        }
      : compromisso
  );
  return compromissos.find((compromisso) => compromisso.id === id) || null;
};
