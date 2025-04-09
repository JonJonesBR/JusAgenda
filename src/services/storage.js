import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Wrapper para AsyncStorage com suporte a objetos JSON.
 * Adiciona tratamento de erros e serialização automática.
 */
class Storage {
  async getItem(key) {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Erro ao ler ${key}:`, error);
      return null;
    }
  }

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
      throw error;
    }
  }
}

export const storage = new Storage();

// Event storage functions with improved error handling
export const saveEvent = async (event) => {
  try {
    if (!event || !event.id) {
      throw new Error("Evento inválido ou sem ID");
    }
    const events = (await storage.getItem("@jusagenda_events")) || [];
    const existingIndex = events.findIndex((e) => e.id === event.id);

    if (existingIndex >= 0) {
      events[existingIndex] = { ...events[existingIndex], ...event };
    } else {
      events.push(event);
    }

    await storage.setItem("@jusagenda_events", events);
    return event;
  } catch (error) {
    console.error("Erro ao salvar evento:", error);
    throw new Error("Não foi possível salvar o evento");
  }
};

export const getEvents = async () => {
  try {
    const events = (await storage.getItem("@jusagenda_events")) || [];
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error("Erro ao obter eventos:", error);
    throw new Error("Não foi possível obter os eventos");
  }
};

export const deleteEvent = async (eventId) => {
  try {
    if (!eventId) {
      throw new Error("ID do evento é obrigatório");
    }
    const events = (await storage.getItem("@jusagenda_events")) || [];
    const updatedEvents = events.filter((event) => event.id !== eventId);

    if (events.length === updatedEvents.length) {
      return false; // No event was deleted
    }

    await storage.setItem("@jusagenda_events", updatedEvents);
    return true;
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    throw new Error("Não foi possível excluir o evento");
  }
};
