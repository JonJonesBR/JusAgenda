import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_KEY = 'jus_agenda_events';

/**
 * Saves an event in AsyncStorage.
 * @param {Object} event - Event details object.
 * @throws {Error} If saving the event fails.
 */
export const saveEvent = async (event) => {
  try {
    const existingEvents = await AsyncStorage.getItem(EVENTS_KEY);
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);
    console.log('Eventos antes de salvar:', events); // Debug
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    console.log('Evento salvo com sucesso:', event); // Debug
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    throw new Error('Não foi possível salvar o evento.');
  }
};

/**
 * Retrieves all events from AsyncStorage.
 * @returns {Promise<Array<Object>>} List of events.
 * @throws {Error} If fetching events fails.
 */
export const getEvents = async () => {
  try {
    const events = await AsyncStorage.getItem(EVENTS_KEY);
    console.log('Eventos carregados:', events ? JSON.parse(events) : []); // Debug
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    throw new Error('Não foi possível buscar os eventos.');
  }
};

/**
 * Deletes a specific event by ID.
 * @param {string} eventId - The ID of the event to delete.
 * @throws {Error} If deleting the event fails.
 */
export const deleteEvent = async (eventId) => {
  try {
    const existingEvents = await AsyncStorage.getItem(EVENTS_KEY);
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    const updatedEvents = events.filter((event) => event.id !== eventId);
    console.log('Eventos após exclusão:', updatedEvents); // Debug
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    throw new Error('Não foi possível deletar o evento.');
  }
};

/**
 * Clears all events from AsyncStorage.
 * @throws {Error} If clearing events fails.
 */
export const clearAllEvents = async () => {
  try {
    await AsyncStorage.removeItem(EVENTS_KEY);
    console.log('Todos os eventos foram limpos com sucesso.'); // Debug
  } catch (error) {
    console.error('Erro ao limpar eventos:', error);
    throw new Error('Não foi possível limpar os eventos.');
  }
};
