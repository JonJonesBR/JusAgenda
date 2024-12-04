// src/components/UpcomingEvents.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getEvents } from '../services/storage';
import EventCard from './EventCard';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const { theme } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    const loadEvents = async () => {
      const storedEvents = await getEvents();
      
      // Ordenar eventos por data
      const sortedEvents = storedEvents.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      // Filtrar eventos futuros
      const upcomingEvents = sortedEvents.filter(event => 
        new Date(event.date) >= new Date()
      );

      // Limitar para 5 próximos eventos
      setEvents(upcomingEvents.slice(0, 5));
    };

    loadEvents();
  }, []);

  return (
    <View style={[
      styles.container, 
      { backgroundColor: currentTheme.background }
    ]}>
      <Text style={[
        styles.title, 
        { color: currentTheme.text }
      ]}>
        Próximos Eventos
      </Text>
      
      {events.length === 0 ? (
        <Text style={[
          styles.noEventsText, 
          { color: currentTheme.text + '80' }
        ]}>
          Nenhum evento próximo
        </Text>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => {/* Navegação para detalhes */}}
            />
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16
  }
});

export default UpcomingEvents;