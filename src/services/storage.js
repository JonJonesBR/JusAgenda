import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Event storage functions
export const saveEvent = async (event) => {
  const events = await storage.getItem('events') || [];
  events.push(event);
  await storage.setItem('events', events);
};

export const getEvents = async () => {
  return await storage.getItem('events') || [];
};

export const deleteEvent = async (eventId) => {
  const events = await storage.getItem('events') || [];
  const updatedEvents = events.filter(event => event.id !== eventId);
  await storage.setItem('events', updatedEvents);
};
