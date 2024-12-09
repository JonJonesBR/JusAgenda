import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave única para armazenar eventos
const EVENTS_KEY = 'jus_agenda_events';

/**
 * Salva um evento no AsyncStorage.
 * @param {Object} event - Objeto contendo os detalhes do evento.
 * @throws {Error} Se não for possível salvar o evento.
 */
export const saveEvent = async (event) => {
  try {
    const existingEvents = await AsyncStorage.getItem(EVENTS_KEY);
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    throw new Error('Não foi possível salvar o evento.');
  }
};

/**
 * Obtém todos os eventos do AsyncStorage.
 * @returns {Promise<Array<Object>>} Lista de eventos.
 * @throws {Error} Se não for possível buscar os eventos.
 */
export const getEvents = async () => {
  try {
    const events = await AsyncStorage.getItem(EVENTS_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw new Error('Não foi possível buscar os eventos.');
  }
};

/**
 * Deleta um evento específico pelo ID.
 * @param {string} eventId - O ID do evento a ser deletado.
 * @throws {Error} Se não for possível deletar o evento.
 */
export const deleteEvent = async (eventId) => {
  try {
    const existingEvents = await AsyncStorage.getItem(EVENTS_KEY);
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    const updatedEvents = events.filter((event) => event.id !== eventId); // Correção do filtro
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    throw new Error('Não foi possível deletar o evento.');
  }
};

/**
 * Limpa todos os eventos do AsyncStorage.
 * @throws {Error} Se não for possível limpar os eventos.
 */
export const clearAllEvents = async () => {
  try {
    await AsyncStorage.removeItem(EVENTS_KEY);
  } catch (error) {
    console.error('Erro ao limpar eventos:', error);
    throw new Error('Não foi possível limpar os eventos.');
  }
};
