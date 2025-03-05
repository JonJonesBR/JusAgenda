import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Icon } from '@rneui/themed';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { searchEvents } from '../services/EventService';

const SearchResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { term, filters } = route.params || {};
  const [events, setEvents] = useState([]);

  const searchForEvents = useCallback(() => {
    let results = searchEvents(term || '');
    if (filters && filters.length > 0) {
      results = results.filter(event =>
        filters.includes(event.type?.toLowerCase())
      );
    }
    results.sort((a, b) => new Date(a.date) - new Date(b.date));
    setEvents(results);
  }, [term, filters]);

  useEffect(() => {
    if (isFocused) searchForEvents();
  }, [isFocused, searchForEvents]);

  const getEventTypeIcon = useCallback((type) => {
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
  }, []);

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
          Nenhum compromisso encontrado{term ? ` para "${term}"` : ''}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.resultsText}>
        {events.length} {events.length === 1 ? 'compromisso encontrado' : 'compromissos encontrados'}{term ? ` para "${term}"` : ''}
      </Text>
      {events.map((event) => {
        const icon = getEventTypeIcon(event.type);
        return (
          <TouchableOpacity key={event.id} onPress={() => navigation.navigate('EventDetails', { event })}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#757575', textAlign: 'center' },
  resultsText: { fontSize: 16, color: '#757575', marginBottom: 16 },
  card: { borderRadius: 10, padding: 16, marginBottom: 8, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eventType: { marginLeft: 8, fontSize: 14, color: '#757575' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#000' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  date: { marginLeft: 8, fontSize: 14, color: '#000' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  location: { marginLeft: 8, fontSize: 14, color: '#000', flex: 1 },
  clientContainer: { flexDirection: 'row', alignItems: 'center' },
  client: { marginLeft: 8, fontSize: 14, color: '#000', flex: 1 },
});

export default SearchResultsScreen;
