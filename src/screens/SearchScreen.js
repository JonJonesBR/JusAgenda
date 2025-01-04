import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SearchBar, Button, Text, Card, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const navigation = useNavigation();

  const filters = [
    { id: 'audiencia', label: 'Audiência', icon: 'gavel' },
    { id: 'reuniao', label: 'Reunião', icon: 'groups' },
    { id: 'prazo', label: 'Prazo', icon: 'timer' },
    { id: 'outros', label: 'Outros', icon: 'event' },
  ];

  const toggleFilter = (filterId) => {
    setSelectedFilters((current) =>
      current.includes(filterId)
        ? current.filter((id) => id !== filterId)
        : [...current, filterId]
    );
  };

  const handleSearch = () => {
    navigation.navigate('SearchResults', {
      term: searchTerm,
      filters: selectedFilters,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.title}>Buscar Eventos</Text>
        <Text style={styles.subtitle}>
          Pesquise por título, cliente, descrição ou local
        </Text>
      </View>

      <Card containerStyle={styles.searchCard}>
        <SearchBar
          placeholder="Digite sua busca..."
          onChangeText={setSearchTerm}
          value={searchTerm}
          platform="default"
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          round
        />

        <Text style={styles.filterTitle}>Filtrar por tipo:</Text>
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <Button
              key={filter.id}
              title={filter.label}
              icon={{
                name: filter.icon,
                size: 20,
                color: selectedFilters.includes(filter.id) ? 'white' : '#6200ee',
              }}
              type={selectedFilters.includes(filter.id) ? 'solid' : 'outline'}
              buttonStyle={[
                styles.filterButton,
                selectedFilters.includes(filter.id) && styles.filterButtonActive,
              ]}
              titleStyle={[
                styles.filterButtonText,
                selectedFilters.includes(filter.id) && styles.filterButtonTextActive,
              ]}
              onPress={() => toggleFilter(filter.id)}
            />
          ))}
        </View>

        <Button
          title="Buscar"
          icon={{
            name: 'search',
            size: 20,
            color: 'white',
          }}
          buttonStyle={styles.searchButton}
          onPress={handleSearch}
          disabled={!searchTerm && selectedFilters.length === 0}
        />
      </Card>

      <Card containerStyle={styles.tipsCard}>
        <Card.Title>
          <View style={styles.cardTitleContainer}>
            <Icon name="lightbulb" color="#6200ee" size={24} />
            <Text style={styles.cardTitle}>Dicas de Busca</Text>
          </View>
        </Card.Title>
        <Card.Divider />
        <View style={styles.tipItem}>
          <Icon name="info" color="#6200ee" size={20} />
          <Text style={styles.tipText}>
            Use palavras-chave específicas para encontrar eventos mais facilmente
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="filter-list" color="#6200ee" size={20} />
          <Text style={styles.tipText}>
            Combine filtros para refinar sua busca
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 16,
  },
  searchCard: {
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: -20,
    elevation: 4,
    padding: 15,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchBarInput: {
    backgroundColor: '#f5f5f5',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#000000',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  filterButton: {
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
    borderColor: '#6200ee',
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6200ee',
  },
  filterButtonText: {
    color: '#6200ee',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  searchButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    height: 50,
  },
  tipsCard: {
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    elevation: 4,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    marginLeft: 8,
    color: '#6200ee',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
});

export default SearchScreen;
