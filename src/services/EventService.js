import { generateId, EVENT_TYPES } from "../utils/common";
import { storage } from "./storage";

const STORAGE_KEY = "@jusagenda_events";

/**
 * Retorna todos os compromissos ordenados por data.
 * @returns {Promise<Array>} Lista ordenada de compromissos.
 */
export const getAllCompromissos = async () => {
  try {
    const storedEvents = (await storage.getItem(STORAGE_KEY)) || [];

    // Validate and fix any invalid dates before returning
    const validatedEvents = storedEvents.map((event) => {
      if (!event.date) {
        console.warn(
          `[Event ${event.id}] Missing date field, using current date`
        );
        return { ...event, date: new Date(), data: new Date() };
      }

      // Migrate: if event has date but missing data, copy date to data
      if (!event.data && event.date) {
        event.data = event.date;
      }

      try {
        const dateObj = new Date(event.date);
        if (isNaN(dateObj.getTime())) {
          console.warn(
            `[Event ${event.id}] Invalid date format: ${event.date}, using current date`
          );
          return { ...event, date: new Date(), data: new Date() };
        }
        return { ...event, date: dateObj, data: dateObj };
      } catch (error) {
        console.warn(
          `[Event ${event.id}] Error processing date: ${error.message}, using current date`
        );
        return { ...event, date: new Date(), data: new Date() };
      }
    });

    // Save the fixed events back to storage (always save to persist migration)
    await storage.setItem(STORAGE_KEY, validatedEvents);

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
 * Temporary debug function to log all stored events and their dates.
 */
export const logStoredEvents = async () => {
  try {
    const events = (await storage.getItem(STORAGE_KEY)) || [];
    console.log(`Total stored events: ${events.length}`);
    events.forEach((event, index) => {
      console.log(
        `Event ${index + 1}: id=${event.id}, date=${event.date}, data=${event.data}`
      );
    });
  } catch (error) {
    console.error("Error logging stored events:", error);
  }
};

/**
 * Retorna os compromissos futuros ordenados por data.
 * @returns {Promise<Array>} Lista ordenada de compromissos futuros.
 */
export const getUpcomingCompromissos = async () => {
  try {
    const now = new Date();
    const storedEvents = (await storage.getItem(STORAGE_KEY)) || [];

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
    // Verifique se a data é válida
    if (!compromisso.date) {
      throw new Error("A data do compromisso é obrigatória");
    }

    let dateToUse;
    if (
      compromisso.date instanceof Date &&
      !isNaN(compromisso.date.getTime())
    ) {
      dateToUse = compromisso.date;
    } else if (typeof compromisso.date === "string") {
      const parsedDate = new Date(compromisso.date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Data inválida: ${compromisso.date}`);
      }
      dateToUse = parsedDate;
    } else {
      throw new Error(`Formato de data inválido: ${compromisso.date}`);
    }

    const newCompromisso = {
      ...compromisso,
      date: dateToUse,
      data: dateToUse, // add Portuguese 'data' field for compatibility
      id: generateId(),
      notificationId: null,
      calendarEventId: null,
    };

    console.log("Saving compromisso:", newCompromisso);

    const currentEvents = (await storage.getItem(STORAGE_KEY)) || [];
    const updatedEvents = [...currentEvents, newCompromisso];
    await storage.setItem(STORAGE_KEY, updatedEvents);
    return newCompromisso;
  } catch (error) {
    console.error("Erro ao adicionar compromisso:", error.message);
    throw new Error(
      error.message || "Não foi possível adicionar o compromisso."
    );
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
      let dateObj;
      if (updatedCompromisso.date instanceof Date) {
        // Preserve the exact time by using UTC methods
        const year = updatedCompromisso.date.getFullYear();
        const month = updatedCompromisso.date.getMonth();
        const day = updatedCompromisso.date.getDate();
        const hours = updatedCompromisso.date.getHours();
        const minutes = updatedCompromisso.date.getMinutes();
        dateObj = new Date(Date.UTC(year, month, day, hours, minutes));
      } else {
        // Parse the date string and create a new Date object using UTC
        const [datePart, timePart] = updatedCompromisso.date.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        if (timePart) {
          const [hours, minutes] = timePart.split(":").map(Number);
          dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        } else {
          dateObj = new Date(Date.UTC(year, month - 1, day));
        }
      }

      if (isNaN(dateObj.getTime())) {
        throw new Error(
          `Data inválida: ${updatedCompromisso.date}. Utilize o formato UTC (YYYY-MM-DDTHH:mm)`
        );
      }
      // Ensure date is a Date object with correct local time
      updatedCompromisso.date = dateObj;
    }

    const currentEvents = (await storage.getItem(STORAGE_KEY)) || [];
    const updatedEvents = currentEvents.map((compromisso) =>
      compromisso.id === id
        ? { ...compromisso, ...updatedCompromisso }
        : compromisso
    );
    await storage.setItem(STORAGE_KEY, updatedEvents);
    return updatedEvents.find((compromisso) => compromisso.id === id) || null;
  } catch (error) {
    console.error("Erro ao atualizar compromisso:", error);
    throw new Error(`Falha na atualização: ${error.message}`);
  }
};

/**
 * Remove um compromisso.
 * @param {string} id - ID do compromisso.
 * @returns {Promise<boolean>} True se a remoção for bem-sucedida, false caso contrário.
 */
export const deleteCompromisso = async (id) => {
  try {
    const currentEvents = (await storage.getItem(STORAGE_KEY)) || [];
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
    const currentEvents = (await storage.getItem(STORAGE_KEY)) || [];
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
    const currentEvents = (await storage.getItem(STORAGE_KEY)) || [];
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
export const updateCompromissoNotifications = async (
  id,
  { notificationId, calendarEventId }
) => {
  try {
    const currentEvents = (await storage.getItem(STORAGE_KEY)) || [];
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

export const saveCompromisso = async (compromisso) => {
  try {
    if (!compromisso.title?.trim()) {
      throw new Error("Título do evento é obrigatório");
    }

    if (!Object.values(EVENT_TYPES).includes(compromisso.type)) {
      throw new Error(`Tipo de evento inválido: ${compromisso.type}`);
    }

    // Validate date
    if (!compromisso.date) {
      throw new Error("A data do compromisso é obrigatória");
    }

    let dateToUse;
    if (
      compromisso.date instanceof Date &&
      !isNaN(compromisso.date.getTime())
    ) {
      dateToUse = compromisso.date;
    } else if (typeof compromisso.date === "string") {
      const parsedDate = new Date(compromisso.date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Data inválida: ${compromisso.date}`);
      }
      dateToUse = parsedDate;
    } else {
      throw new Error(`Formato de data inválido: ${compromisso.date}`);
    }

    compromisso.date = dateToUse;

    const events = (await storage.getItem(STORAGE_KEY)) || [];
    const index = events.findIndex((e) => e.id === compromisso.id);

    if (index === -1) {
      events.push({ ...compromisso, id: generateId() });
    } else {
      events[index] = compromisso;
    }

    await storage.setItem(STORAGE_KEY, events);
    return true;
  } catch (error) {
    console.error(`Falha ao salvar evento: ${error.message}`, {
      extra: {
        eventData: compromisso,
        operation: "save_event",
        storageKey: STORAGE_KEY,
      },
    });
    throw new Error(`Falha ao salvar evento: ${error.message}`);
  }
};

/**
 * Temporary function to clean invalid events from AsyncStorage.
 * Call this once inside the app to remove known invalid events.
 */
export const cleanupInvalidEventsInApp = async () => {
  const INVALID_EVENT_IDS = [
    "m8vswslwioo1clazw",
    "m8vsz2ifctzd0zeku",
    "m99uwwhylapv8u5mv",
    "m99ve644i91aoeyts",
    "m99vhnbclw4yh42xk",
  ];

  try {
    const events = (await storage.getItem(STORAGE_KEY)) || [];
    const initialCount = events.length;

    const cleanedEvents = events.filter(
      (event) => !INVALID_EVENT_IDS.includes(event.id)
    );

    const removedCount = initialCount - cleanedEvents.length;

    if (removedCount > 0) {
      await storage.setItem(STORAGE_KEY, cleanedEvents);
      console.log(
        `Removed ${removedCount} invalid events: ${INVALID_EVENT_IDS.join(", ")}`
      );
    } else {
      console.log("No invalid events found to remove.");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};
