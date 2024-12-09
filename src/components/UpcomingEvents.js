import React, { useMemo, useReducer, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getEvents } from '../services/storage';
import EventCard from './EventCard';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';

const UpcomingEvents = () => {
  const { theme } = useTheme();
  const currentTheme = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  const [events, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_EVENTS':
        return action.events;
      default:
        return state;
    }
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const storedEvents = await getEvents();
        const sortedEvents = storedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        const upcomingEvents = sortedEvents.filter(
          (event) => new Date(event.date) >= new Date()
        );
        dispatch({ type: 'SET_EVENTS', events: upcomingEvents.slice(0, 5) });
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    };
    fetchUpcomingEvents();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: currentTheme.text }]}>
        Próximos Eventos
      </Text>
      {events.length === 0 ? (
        <Text style={[styles.noEventsText, { color: currentTheme.text + '80' }]}>
          Nenhum evento próximo
        </Text>
      ) : (
        <FlatList
          accessibilityRole="list"
          data={events}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => {
                /* Navegação para detalhes */
              }}
            />
          )}
          keyExtractor={(item) => item.id || `${item.date}-${item.title}`} // Correção do keyExtractor
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default UpcomingEvents;
