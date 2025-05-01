import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppError, ERROR_CODES } from "../utils/AppError";
import { logger } from "../utils/loggerService";

/**
 * Wrapper para AsyncStorage com suporte a objetos JSON.
 * Adiciona tratamento de erros e serialização automática.
 */
/**
 * Wrapper para AsyncStorage com suporte a objetos JSON.
 * Adiciona tratamento de erros, serialização automática e timeouts.
 */
class Storage {
  /**
   * Obtém um item do AsyncStorage
   * @param {string} key - Chave do item
   * @returns {Promise<any>} O valor obtido, ou null se não encontrado
   * @throws {AppError} Se ocorrer um erro ao ler o item
   */
  async getItem(key) {
    try {
      // Adiciona um timeout para evitar operações bloqueantes
      const itemPromise = Promise.race([
        AsyncStorage.getItem(key),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao ler item de armazenamento")), 3000)
        )
      ]);
      
      const item = await itemPromise;
      logger.debug(`Item lido com sucesso: ${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Erro na desserialização JSON
        logger.error(`Erro ao analisar JSON para ${key}`, error);
        throw new AppError(
          `Dados corrompidos para ${key}`,
          ERROR_CODES.STORAGE.READ,
          false
        );
      } else {
        logger.error(`Erro ao ler ${key}`, error);
        throw new AppError(
          `Erro ao ler dados de ${key}`,
          ERROR_CODES.STORAGE.READ,
          false
        );
      }
    }
  }

  /**
   * Salva um item no AsyncStorage
   * @param {string} key - Chave do item
   * @param {any} value - Valor a ser salvo
   * @throws {AppError} Se ocorrer um erro ao salvar o item
   */
  async setItem(key, value) {
    try {
      // Adiciona um timeout para evitar operações bloqueantes
      const setPromise = Promise.race([
        AsyncStorage.setItem(key, JSON.stringify(value)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao salvar item no armazenamento")), 3000)
        )
      ]);

      await setPromise;
      logger.debug(`Item salvo com sucesso: ${key}`);
    } catch (error) {
      logger.error(`Erro ao salvar ${key}`, error);
      throw new AppError(
        `Erro ao salvar dados em ${key}`,
        ERROR_CODES.STORAGE.WRITE,
        false
      );
    }
  }

  /**
   * Remove um item do AsyncStorage
   * @param {string} key - Chave do item a ser removido
   * @throws {AppError} Se ocorrer um erro ao remover o item
   */
  async removeItem(key) {
    try {
      // Adiciona um timeout para evitar operações bloqueantes
      const removePromise = Promise.race([
        AsyncStorage.removeItem(key),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao remover item do armazenamento")), 3000)
        )
      ]);

      await removePromise;
      logger.debug(`Item removido com sucesso: ${key}`);
    } catch (error) {
      logger.error(`Erro ao remover ${key}`, error);
      throw new AppError(
        `Erro ao remover dados de ${key}`,
        ERROR_CODES.STORAGE.DELETE,
        false
      );
    }
  }
}

export const storage = new Storage();

// Event storage functions with improved error handling
/**
 * Salva um evento no armazenamento
 * @param {Object} event - Evento a ser salvo
 * @returns {Promise<Object>} O evento salvo
 */
export const saveEvent = async (event) => {
  try {
    if (!event || !event.id) {
      throw new AppError(
        "Evento inválido ou sem ID",
        ERROR_CODES.EVENTS.VALIDATION,
        true
      );
    }
    
    // Busca eventos existentes
    let events;
    try {
      events = (await storage.getItem("@jusagenda_events")) || [];
    } catch (error) {
      // Se não conseguir ler, inicia com uma lista vazia
      logger.warn("Não foi possível ler os eventos existentes, iniciando com lista vazia", error);
      events = [];
    }
    
    const existingIndex = events.findIndex((e) => e.id === event.id);

    if (existingIndex >= 0) {
      events[existingIndex] = { ...events[existingIndex], ...event };
      logger.info(`Evento atualizado: ${event.id}`, { eventType: event.type, title: event.title });
    } else {
      events.push(event);
      logger.info(`Novo evento adicionado: ${event.id}`, { eventType: event.type, title: event.title });
    }

    await storage.setItem("@jusagenda_events", events);
    return event;
  } catch (error) {
    logger.error("Erro ao salvar evento", error, { eventId: event?.id });
    throw AppError.fromError(
      error,
      ERROR_CODES.EVENTS.ADD,
      "Não foi possível salvar o evento"
    );
  }
};

/**
 * Obtém todos os eventos ordenados por data
 * @returns {Promise<Array>} Lista de eventos ordenados
 */
export const getEvents = async () => {
  try {
    const events = (await storage.getItem("@jusagenda_events")) || [];
    
    // Valida os eventos antes de retornar
    const validEvents = events.filter(event => {
      if (!event || !event.id) {
        logger.warn("Evento inválido encontrado e removido", { event });
        return false;
      }
      return true;
    });
    
    logger.debug(`${validEvents.length} eventos recuperados com sucesso`);
    return validEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    logger.error("Erro ao obter eventos", error);
    throw AppError.fromError(
      error,
      ERROR_CODES.EVENTS.GET,
      "Não foi possível obter os eventos"
    );
  }
};

/**
 * Exclui um evento do armazenamento
 * @param {string} eventId - ID do evento a ser excluído
 * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
 */
export const deleteEvent = async (eventId) => {
  try {
    if (!eventId) {
      throw new AppError(
        "ID do evento é obrigatório",
        ERROR_CODES.EVENTS.VALIDATION,
        true
      );
    }
    
    const events = (await storage.getItem("@jusagenda_events")) || [];
    const updatedEvents = events.filter((event) => event.id !== eventId);

    if (events.length === updatedEvents.length) {
      logger.warn(`Tentativa de excluir evento inexistente: ${eventId}`);
      return { 
        success: false, 
        message: "Evento não encontrado" 
      };
    }

    await storage.setItem("@jusagenda_events", updatedEvents);
    logger.info(`Evento excluído com sucesso: ${eventId}`);
    
    return { 
      success: true,
      message: "Evento excluído com sucesso" 
    };
  } catch (error) {
    logger.error("Erro ao excluir evento", error, { eventId });
    throw AppError.fromError(
      error,
      ERROR_CODES.EVENTS.DELETE,
      "Não foi possível excluir o evento"
    );
  }
};
