import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getEvents, deleteEvent } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme } from '../constants/colors';

const SearchResultsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const currentTheme = darkTheme;

  const { term, filters } = route.params || {};
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        console.log('Iniciando busca de eventos...'); // Debug
        console.log('Termo de busca:', term); // Debug
        console.log('Filtros ativos:', filters); // Debug

        const storedEvents = await getEvents();
        console.log('Eventos carregados:', storedEvents); // Debug

        if (!Array.isArray(storedEvents)) {
          console.error('Eventos armazenados não é um array:', storedEvents);
          return;
        }

        let filteredResults = [...storedEvents];

        // Filtro por termo de busca
        if (term) {
          filteredResults = filteredResults.filter((event) => {
            const searchFields = [
              event.title,
              event.client,
              event.description,
              event.location
            ].filter(Boolean); // Remove campos undefined/null

            const searchText = searchFields.join(' ').toLowerCase();
            return searchText.includes(term.toLowerCase());
          });
          console.log('Resultados após filtro por termo:', filteredResults); // Debug
        }

        // Filtro por tipo
        if (filters && filters.length > 0) {
          console.log('Aplicando filtro por tipos:', filters); // Debug
          filteredResults = filteredResults.filter((event) => {
            const eventType = (event.type || '').toLowerCase();
            const matchingFilter = filters.some(filter => filter.toLowerCase() === eventType);
            console.log(`Evento ${event.title} (tipo: ${eventType}) corresponde aos filtros? ${matchingFilter}`); // Debug
            return matchingFilter;
          });
          console.log('Resultados após filtro por tipo:', filteredResults); // Debug
        }

        // Ordenar por data
        filteredResults.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() === dateB.getTime()) {
            return a.title.localeCompare(b.title);
          }
          return dateA - dateB;
        });

        console.log('Resultados finais:', filteredResults); // Debug
        setFilteredEvents(filteredResults);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os eventos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndFilterEvents();
  }, [term, filters]);

  const handleEditEvent = (event) => {
    console.log('Editando evento:', event); // Debug
    navigation.navigate('EventCreate', { eventType: event.type, event });
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Excluir Evento',
      'Tem certeza que deseja excluir este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(eventId);
              setFilteredEvents((prev) => prev.filter((event) => event.id !== eventId));
              Alert.alert('Sucesso', 'Evento excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir evento:', error);
              Alert.alert('Erro', 'Não foi possível excluir o evento.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderDetailedItem = ({ item }) => (
    <View style={[styles.eventCard, { backgroundColor: currentTheme.card }]}>
      <Text style={[styles.eventTitle, { color: currentTheme.text }]}>{item.title}</Text>
      <Text style={[styles.eventDetail, { color: currentTheme.text }]}>
        Data: {item.date || 'Não informada'}
      </Text>
      {item.client && (
        <Text style={[styles.eventDetail, { color: currentTheme.text }]}>
          Cliente: {item.client}
        </Text>
      )}
      <Text style={[styles.eventDetail, { color: currentTheme.text }]}>
        Tipo: {item.type || 'Outros'}
      </Text>
      {item.notes && (
        <Text style={[styles.eventDetail, { color: currentTheme.text }]}>
          Notas: {item.notes}
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => handleEditEvent(item)}
        >
          <Text style={[styles.buttonText, { color: currentTheme.card }]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: '#FF6347' }]}
          onPress={() => handleDeleteEvent(item.id)}
        >
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {isLoading ? (
        <Text style={[styles.loadingText, { color: currentTheme.text }]}>Carregando...</Text>
      ) : filteredEvents.length === 0 ? (
        <Text style={[styles.noResultsText, { color: currentTheme.text + '80' }]}>
          Nenhum evento encontrado
        </Text>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderDetailedItem}
          keyExtractor={(item) => item.id || `${item.date}-${item.title}`}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 15,
  },
  eventCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDetail: {
    fontSize: 14,
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  deleteButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default SearchResultsScreen;
