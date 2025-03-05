import { generateId, EVENT_TYPES } from '../utils/common';
import { storage } from './storage';

const STORAGE_KEY = '@jusagenda_events';

/**
 * Retorna todos os compromissos ordenados por data.
 * @returns {Promise<Array>} Lista ordenada de compromissos.
 */
export const getAllCompromissos = async () => {
  try {
    const storedEvents = await storage.getItem(STORAGE_KEY) || [];
    const sorted = [...storedEvents].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sorted;
  } catch (error) {
    console.error("Erro ao obter compromissos:", error);
    throw error;
  }
};

/**
 * Retorna os compromissos futuros ordenados por data.
 * @returns {Promise<Array>} Lista ordenada de compromissos futuros.
 */
export const getUpcomingCompromissos = async () => {
  try {
    const now = new Date();
    const storedEvents = await storage.getItem(STORAGE_KEY) || [];
    const upcoming = storedEvents
      .filter((compromisso) => new Date(compromisso.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming;
  } catch (error) {
    console.error("Erro ao obter compromissos futuros:", error);
    throw error;
  }
};

/**
 * Adiciona um novo compromisso.
 * @param {Object} compromisso - Dados do compromisso.
 * @returns {Promise<Object>} O compromisso adicionado.
 * @throws {Error} Se não for possível adicionar o compromisso.
 */
export const addCompromisso = async (compromisso) => {
  try {
    const newCompromisso = {
      ...compromisso,
      id: generateId(),
      notificationId: null,
      calendarEventId: null,
    };
    const currentEvents = await storage.getItem(STORAGE_KEY) || [];
    const updatedEvents = [...currentEvents, newCompromisso];
    await storage.setItem(STORAGE_KEY, updatedEvents);
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
 * @returns {Promise<Object|null>} O compromisso atualizado ou null se não encontrado.
 */
export const updateCompromisso = async (id, updatedCompromisso) => {
  try {
    const currentEvents = await storage.getItem(STORAGE_KEY) || [];
    const updatedEvents = currentEvents.map((compromisso) =>
      compromisso.id === id
        ? { ...compromisso, ...updatedCompromisso }
        : compromisso
    );
    await storage.setItem(STORAGE_KEY, updatedEvents);
    return updatedEvents.find((compromisso) => compromisso.id === id) || null;
  } catch (error) {
    console.error("Erro ao atualizar compromisso:", error);
    throw error;
  }
};

/**
 * Remove um compromisso.
 * @param {string} id - ID do compromisso.
 * @returns {Promise<boolean>} True se a remoção for bem-sucedida, false caso contrário.
 */
export const deleteCompromisso = async (id) => {
  try {
    const currentEvents = await storage.getItem(STORAGE_KEY) || [];
    const exists = currentEvents.some((compromisso) => compromisso.id === id);
    if (exists) {
      const updatedEvents = currentEvents.filter(
        (compromisso) => compromisso.id !== id
      );
      await storage.setItem(STORAGE_KEY, updatedEvents);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao excluir compromisso:", error);
    throw error;
  }
};

/**
 * Busca compromissos que correspondam à consulta de texto.
 * @param {string} query - Texto para busca.
 * @returns {Promise<Array>} Lista de compromissos que correspondem à consulta.
 */
export const searchCompromissos = async (query) => {
  try {
    const currentEvents = await storage.getItem(STORAGE_KEY) || [];
    const lowerQuery = query.toLowerCase();
    return currentEvents.filter(
      (compromisso) =>
        compromisso.title?.toLowerCase().includes(lowerQuery) ||
        compromisso.client?.toLowerCase().includes(lowerQuery) ||
        compromisso.description?.toLowerCase().includes(lowerQuery) ||
        compromisso.location?.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error("Erro ao buscar compromissos:", error);
    throw error;
  }
};

/**
 * Retorna um compromisso específico pelo ID.
 * @param {string} id - ID do compromisso.
 * @returns {Promise<Object|undefined>} O compromisso ou undefined se não encontrado.
 */
export const getCompromissoById = async (id) => {
  try {
    const currentEvents = await storage.getItem(STORAGE_KEY) || [];
    return currentEvents.find((compromisso) => compromisso.id === id);
  } catch (error) {
    console.error("Erro ao obter compromisso por ID:", error);
    throw error;
  }
};

/**
 * Atualiza os IDs de notificação e calendário de um compromisso.
 * @param {string} id - ID do compromisso.
 * @param {Object} ids - Objeto contendo notificationId e/ou calendarEventId.
 * @returns {Promise<Object|null>} O compromisso atualizado ou null se não encontrado.
 */
export const updateCompromissoNotifications = async (id, { notificationId, calendarEventId }) => {
  try {
    const currentEvents = await storage.getItem(STORAGE_KEY) || [];
    const updatedEvents = currentEvents.map((compromisso) =>
      compromisso.id === id
        ? {
            ...compromisso,
            notificationId: notificationId ?? compromisso.notificationId,
            calendarEventId: calendarEventId ?? compromisso.calendarEventId,
          }
        : compromisso
    );
    await storage.setItem(STORAGE_KEY, updatedEvents);
    return updatedEvents.find((compromisso) => compromisso.id === id) || null;
  } catch (error) {
    console.error("Erro ao atualizar notificações do compromisso:", error);
    throw error;
  }
};
