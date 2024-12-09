import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';
import EventCard from '../components/EventCard';

/**
 * Tela para exibir resultados de busca.
 * @param {Object} props
 * @param {Object} props.route - Contém os parâmetros da navegação.
 * @param {Function} props.navigation - Navegação do React Navigation.
 */
const SearchResultsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const { filters } = route.params || { filters: {} };

  const filteredResults = []; // Substitua por lógica real para filtrar eventos com base em `filters`

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.header, { color: currentTheme.text }]}>
        Resultados da Busca
      </Text>
      {filteredResults.length === 0 ? (
        <Text style={[styles.noResults, { color: currentTheme.text + '80' }]}>
          Nenhum resultado encontrado.
        </Text>
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
});

export default SearchResultsScreen;
