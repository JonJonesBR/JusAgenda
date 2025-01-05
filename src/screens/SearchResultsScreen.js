import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { searchEvents } from '../services/EventService';

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { term, filters } = route.params || {};
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const results = searchEvents(term || '');
    if (filters && filters.length > 0) {
      const filteredResults = results.filter(event => 
        filters.includes(event.type?.toLowerCase())
      );
      setEvents(filteredResults);
    } else {
      setEvents(results);
    }
  }, [term, filters]);

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
      year: 'numeric',
    });
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="search-off" size={48} color="#757575" />
        <Text style={styles.emptyText}>
          Nenhum evento encontrado
          {term ? ` para "${term}"` : ''}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.resultsText}>
        {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
        {term ? ` para "${term}"` : ''}
      </Text>

      {events.map(event => {
        const icon = getEventTypeIcon(event.type);
        return (
          <Card
            key={event.id}
            containerStyle={styles.card}
            onPress={() => navigation.navigate('EventDetails', { event })}
          >
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
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  resultsText: {
    fontSize: 16,
    color: '#757575',
    margin: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    elevation: 4,
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

export default SearchResultsScreen;
