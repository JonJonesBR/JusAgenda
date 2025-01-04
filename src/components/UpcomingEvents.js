import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { getUpcomingEvents } from '../services/EventService';

const UpcomingEvents = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const upcomingEvents = getUpcomingEvents();
    setEvents(upcomingEvents);
  };

  const getEventTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'audiencia':
        return { name: 'gavel', color: '#6200ee' };
      case 'reuniao':
        return { name: 'groups', color: '#03dac6' };
      case 'prazo':
        return { name: 'timer', color: '#ff0266' };
      default:
        return { name: 'event', color: '#018786' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  if (events.length === 0) {
    return (
      <Card containerStyle={styles.emptyCard}>
        <Icon name="event-busy" size={48} color="#757575" />
        <Text style={styles.emptyText}>Nenhum evento próximo</Text>
      </Card>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {events.map((event) => {
        const icon = getEventTypeIcon(event.type);
        return (
          <TouchableOpacity
            key={event.id}
            onPress={() => navigation.navigate('EventDetails', { event })}
          >
            <Card containerStyle={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name={icon.name} color={icon.color} size={24} />
                <Text style={styles.eventType}>
                  {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                </Text>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {event.title}
              </Text>

              <View style={styles.dateContainer}>
                <Icon name="calendar-today" size={16} color="#757575" />
                <Text style={styles.date}>{formatDate(event.date)}</Text>
              </View>

              {event.location && (
                <View style={styles.locationContainer}>
                  <Icon name="location-on" size={16} color="#757575" />
                  <Text style={styles.location} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
              )}

              {event.client && (
                <View style={styles.clientContainer}>
                  <Icon name="person" size={16} color="#757575" />
                  <Text style={styles.client} numberOfLines={1}>
                    {event.client}
                  </Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 10,
    marginRight: 8,
    marginLeft: 8,
    padding: 16,
    elevation: 4,
  },
  emptyCard: {
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  client: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
});

export default UpcomingEvents;
