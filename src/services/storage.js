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
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving event:', error);
    throw new Error('Could not save the event.');
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
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Could not fetch the events.');
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
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Could not delete the event.');
  }
};

/**
 * Clears all events from AsyncStorage.
 * @throws {Error} If clearing events fails.
 */
export const clearAllEvents = async () => {
  try {
    await AsyncStorage.removeItem(EVENTS_KEY);
  } catch (error) {
    console.error('Error clearing events:', error);
    throw new Error('Could not clear the events.');
  }
};
