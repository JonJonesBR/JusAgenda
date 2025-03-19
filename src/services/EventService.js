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
    
    // Validate and fix any invalid dates before returning
    const validatedEvents = storedEvents.map(event => {
      if (!event.date) {
        console.warn(`[Event ${event.id}] Missing date field, using current date`);
        return { ...event, date: new Date().toISOString() };
      }

      try {
        const dateObj = new Date(event.date);
        if (isNaN(dateObj.getTime())) {
          console.warn(`[Event ${event.id}] Invalid date format: ${event.date}, using current date`);
          return { ...event, date: new Date().toISOString() };
        }

        const isoDate = dateObj.toISOString();
        if (isoDate !== event.date) {
          console.warn(`[Event ${event.id}] Normalizing date format from ${event.date} to ${isoDate}`);
          return { ...event, date: isoDate };
        }

        return event;
      } catch (error) {
        console.warn(`[Event ${event.id}] Error processing date: ${error.message}, using current date`);
        return { ...event, date: new Date().toISOString() };
      }
    });
    
    // Save the fixed events back to storage
    if (JSON.stringify(validatedEvents) !== JSON.stringify(storedEvents)) {
      await storage.setItem(STORAGE_KEY, validatedEvents);
    }
    
    const sorted = [...validatedEvents].sort(
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
    
    // Filter out events with invalid dates and get only upcoming events
    const upcoming = storedEvents
      .filter((compromisso) => {
        if (!compromisso.date) return false;
        
        try {
          const eventDate = new Date(compromisso.date);
          return !isNaN(eventDate.getTime()) && eventDate >= now;
        } catch (err) {
          console.warn(`Invalid date in event: ${compromisso.id}`);
          return false;
        }
      })
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
    // Validate date before saving
    if (compromisso.date) {
      const dateObj = new Date(compromisso.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Data inválida fornecida para o compromisso.");
      }
      // Ensure date is stored in a consistent format
      compromisso.date = dateObj.toISOString();
    }

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
    throw new Error(error.message || "Não foi possível adicionar o compromisso.");
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
    // Validate date before updating
    if (updatedCompromisso.date) {
      const dateObj = new Date(updatedCompromisso.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Data inválida fornecida para o compromisso.");
      }
      // Ensure date is stored in a consistent format
      updatedCompromisso.date = dateObj.toISOString();
    }

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
