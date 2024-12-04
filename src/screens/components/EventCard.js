// src/components/EventCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';

const EventCard = ({ event, onPress }) => {
  const { theme } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const getEventTypeColor = (type) => {
    const colors = {
      audiencia: '#2C8CB4',
      reuniao: '#1A5F7A',
      prazo: '#134B6A',
      outros: '#4A4A4A'
    };
    return colors[type] || colors.outros;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: currentTheme.card,
          borderLeftColor: getEventTypeColor(event.type)
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text 
          style={[
            styles.eventType, 
            { 
              color: getEventTypeColor(event.type),
              backgroundColor: getEventTypeColor(event.type) + '20' 
            }
          ]}
        >
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </Text>
        <Text style={[styles.dateText, { color: currentTheme.text }]}>
          {event.date}
        </Text>
      </View>
      <Text 
        style={[
          styles.eventTitle, 
          { color: currentTheme.text }
        ]}
        numberOfLines={1}
      >
        {event.title}
      </Text>
      {event.client && (
        <Text 
          style={[
            styles.clientText, 
            { color: currentTheme.text + '80' }
          ]}
          numberOfLines={1}
        >
          {event.client}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  eventType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold'
  },
  dateText: {
    fontSize: 14
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  clientText: {
    fontSize: 14
  }
});

export default EventCard;