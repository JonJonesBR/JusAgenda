// src/components/EventCard.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';

const EventCard = ({ event, onPress }) => {
  const { theme } = useTheme();
  const currentTheme = useMemo(() => theme === 'light' ? lightTheme : darkTheme, [theme]);

  const getEventTypeColorCode = (type) => {
    const colors = {
      audiencia: '#2C8CB4',
      reuniao: '#1A5F7A',
      prazo: '#134B6A',
      outros: '#4A4A4A'
    };
    return colors[type] || colors.outros;
  };

  const eventTypeColor = useMemo(() => getEventTypeColorCode(event.type), [event.type]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[
        styles.card,
        { backgroundColor: currentTheme.card, borderLeftColor: eventTypeColor }
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text
          accessibilityRole="header"
          style={[
            styles.eventType,
            { color: eventTypeColor, backgroundColor: `${eventTypeColor}20` }
          ]}
        >
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </Text>
        <Text style={[styles.dateText, { color: currentTheme.text }]}>
          {event.date}
        </Text>
      </View>
      <Text
        accessibilityRole="header"
        style={[styles.eventTitle, { color: currentTheme.text }]}
        numberOfLines={1}
      >
        {event.title}
      </Text>
      {event.client && (
        <Text style={[styles.clientText, { color: `${currentTheme.text}80` }]} numberOfLines={1}>
          {event.client}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ...
});

export default EventCard;
