// src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveEvent = async (event) => {
  try {
    const existingEvents = await AsyncStorage.getItem('jus_agenda_events');
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);
    await AsyncStorage.setItem('jus_agenda_events', JSON.stringify(events));
  } catch (error) {
    console.error('Erro ao salvar evento', error);
  }
};

export const getEvents = async () => {
  try {
    const events = await AsyncStorage.getItem('jus_agenda_events');
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Erro ao buscar eventos', error);
    return [];
  }
};