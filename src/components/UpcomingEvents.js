import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from '@rneui/themed';
import { useEvents } from '../contexts/EventContext';
import { formatDateTime } from '../utils/dateUtils';

const UpcomingEvents = ({ onEventPress }) => {
  const { events } = useEvents();

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.title}>Próximos Compromissos</Text>
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map((event) => (
          <Card key={event.id} containerStyle={styles.card}>
            <Card.Title>{event.title}</Card.Title>
            <Card.Divider />
            <Text style={styles.dateText}>
              {formatDateTime(event.startDate)}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {event.description}
            </Text>
          </Card>
        ))
      ) : (
        <Text style={styles.noEventsText}>Nenhum compromisso próximo</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    marginVertical: 15,
    textAlign: 'center',
  },
  card: {
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    color: '#444',
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default UpcomingEvents;