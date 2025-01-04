import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { getAllEvents } from '../services/EventService';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const allEvents = getAllEvents();
    setEvents(allEvents);
    
    // Marca as datas que têm eventos
    const marks = {};
    allEvents.forEach(event => {
      const date = new Date(event.date);
      const dateString = date.toISOString().split('T')[0];
      marks[dateString] = {
        marked: true,
        dotColor: getEventColor(event.type),
      };
    });
    setMarkedDates(marks);
  };

  const getEventColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'audiencia':
        return '#6200ee';
      case 'reuniao':
        return '#03dac6';
      case 'prazo':
        return '#ff0266';
      default:
        return '#018786';
    }
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDayEvents = (dateString) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toISOString().split('T')[0] === dateString;
    });
  };

  const renderEvents = () => {
    if (!selectedDate) return null;

    const dayEvents = getDayEvents(selectedDate);
    if (dayEvents.length === 0) {
      return (
        <Card containerStyle={styles.emptyCard}>
          <Icon name="event-busy" size={48} color="#757575" />
          <Text style={styles.emptyText}>Nenhum evento nesta data</Text>
        </Card>
      );
    }

    return dayEvents.map(event => {
      const icon = getEventTypeIcon(event.type);
      return (
        <Card
          key={event.id}
          containerStyle={styles.eventCard}
          onPress={() => navigation.navigate('EventDetails', { event })}
        >
          <View style={styles.eventHeader}>
            <Icon name={icon.name} color={icon.color} size={24} />
            <Text style={styles.eventType}>
              {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
            </Text>
            <Text style={styles.eventTime}>{formatTime(event.date)}</Text>
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>

          {event.location && (
            <View style={styles.eventDetail}>
              <Icon name="location-on" size={16} color="#757575" />
              <Text style={styles.detailText}>{event.location}</Text>
            </View>
          )}

          {event.client && (
            <View style={styles.eventDetail}>
              <Icon name="person" size={16} color="#757575" />
              <Text style={styles.detailText}>{event.client}</Text>
            </View>
          )}
        </Card>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: '#6200ee',
          },
        }}
        theme={{
          todayTextColor: '#6200ee',
          selectedDayBackgroundColor: '#6200ee',
          arrowColor: '#6200ee',
        }}
      />
      <ScrollView style={styles.eventsContainer}>
        {renderEvents()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  eventsContainer: {
    flex: 1,
    padding: 8,
  },
  emptyCard: {
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  eventCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: '#757575',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
  },
});

export default CalendarScreen;
