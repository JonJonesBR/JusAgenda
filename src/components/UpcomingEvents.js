// UpcomingEvents.js
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';
import { useEvents } from '../contexts/EventContext';
import { formatDateTime } from '../utils/dateUtils';

const UpcomingEvents = ({ onEventPress }) => {
  const { events } = useEvents();

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map((event) => (
          <TouchableOpacity 
            key={event.id} 
            onPress={() => onEventPress(event)}
            activeOpacity={0.8}
          >
            <Card containerStyle={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="event" size={28} color="#6200ee" />
                <Text style={styles.eventType}>
                  {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                </Text>
              </View>
              <Text style={styles.title}>{event.title}</Text>
              <View style={styles.dateContainer}>
                <Icon name="calendar-today" size={20} color="#757575" />
                <Text style={styles.date}>{formatDateTime(event.date)}</Text>
              </View>
            </Card>
          </TouchableOpacity>
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
  card: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  eventType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#6200ee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  date: {
    fontSize: 16,
    marginLeft: 6,
    color: '#757575',
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#757575',
    marginTop: 20,
  },
});

export default UpcomingEvents;
