import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getEvents } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';
import EventCard from '../components/EventCard';

const CalendarViewScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const storedEvents = await getEvents();
        setEvents(storedEvents);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os eventos');
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dailyEvents = events.filter((event) => event.date === selectedDate);
      setFilteredEvents(dailyEvents);
    }
  }, [selectedDate, events]);

  const markedDates = events.reduce((acc, event) => {
    if (event.date) {
      acc[event.date] = { marked: true, dotColor: currentTheme.primary };
    }
    return acc;
  }, {});

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.header, { color: currentTheme.text }]}>Calendário de Eventos</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={currentTheme.primary} />
      ) : (
        <Calendar
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: currentTheme.primary,
            },
          }}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            calendarBackground: currentTheme.background,
            textSectionTitleColor: currentTheme.text,
            selectedDayBackgroundColor: currentTheme.primary,
            selectedDayTextColor: currentTheme.card,
            todayTextColor: currentTheme.secondary,
            dayTextColor: currentTheme.text,
            dotColor: currentTheme.primary,
            arrowColor: currentTheme.primary,
          }}
        />
      )}
      <View style={styles.eventList}>
        {filteredEvents.length === 0 ? (
          <Text style={[styles.noEventsText, { color: currentTheme.text + '80' }]}>
            {selectedDate ? 'Nenhum evento neste dia' : 'Selecione uma data para visualizar eventos'}
          </Text>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id || `${event.date}-${event.title}`}
              event={event}
              onPress={() => navigation.navigate('EventDetails', { event })}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventList: {
    marginTop: 10,
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default CalendarViewScreen;
