import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';
import EventCard from '../components/EventCard';

const SearchResultsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const { filters } = route.params || { filters: {} };
  const [filteredResults, setFilteredResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const simulateSearch = async () => {
      setIsLoading(true);
      try {
        const results = []; // Placeholder for actual search logic
        setFilteredResults(results);
      } catch (error) {
        console.error('Erro ao buscar resultados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    simulateSearch();
  }, [filters]);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.header, { color: currentTheme.text }]}>Resultados da Busca</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={currentTheme.primary} />
      ) : filteredResults.length === 0 ? (
        <Text style={[styles.noResults, { color: currentTheme.text + '80' }]}>Nenhum resultado encontrado.</Text>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', { event: item })}
            />
          )}
          keyExtractor={(item) => item.id || `${item.date}-${item.title}`}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
  },
  separator: {
    height: 10,
  },
});

export default SearchResultsScreen;
