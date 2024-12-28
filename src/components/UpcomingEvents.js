import React, { useMemo, useReducer, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getEvents } from '../services/storage';
import EventCard from './EventCard';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';

const UpcomingEvents = () => {
  const { theme } = useTheme();
  const currentTheme = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  const [isLoading, setIsLoading] = useState(true);

  const [events, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_EVENTS':
        return action.events;
      default:
        return state;
    }
  }, []);

  // Função para validar datas
  const isValidDate = (date) => {
    try {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    } catch (error) {
      console.error('Erro ao validar data:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const storedEvents = await getEvents();
        console.log('Eventos armazenados:', storedEvents); // Debug

        // Filtrar eventos com datas válidas
        const validEvents = storedEvents.filter((event) => isValidDate(event.date));
        console.log('Eventos válidos:', validEvents); // Debug

        const sortedEvents = validEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        const upcomingEvents = sortedEvents.filter(
          (event) => new Date(event.date).getTime() >= new Date().setHours(0, 0, 0, 0)
        ); // Considera apenas eventos a partir de hoje
        console.log('Próximos eventos:', upcomingEvents); // Debug
        dispatch({ type: 'SET_EVENTS', events: upcomingEvents.slice(0, 5) });
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <FlatList
        nestedScrollEnabled // Permite rolagem aninhada
        data={events}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => {
              console.log('Evento clicado:', item); // Debug para navegação futura
            }}
          />
        )}
        keyExtractor={(item) => item.id || `${item.date}-${item.title}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={() => (
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Próximos Eventos
          </Text>
        )}
        ListEmptyComponent={() =>
          !isLoading && (
            <Text style={[styles.noEventsText, { color: currentTheme.text + '80' }]}>
              Nenhum evento próximo
            </Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 15 }}
      />
      {isLoading && (
        <ActivityIndicator size="large" color={currentTheme.primary} style={styles.loading} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 10,
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
  separator: {
    height: 10,
  },
  loading: {
    marginTop: 20,
  },
});

export default UpcomingEvents;
