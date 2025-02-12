import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SearchBar, Button, Text, Card, Icon } from '@rneui/themed';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const navigation = useNavigation();
  const { events, refreshEvents } = useEvents();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) refreshEvents();
  }, [isFocused, refreshEvents]);

  const filters = [
    { id: 'audiencia', label: 'Audiência', icon: 'gavel' },
    { id: 'reuniao', label: 'Reunião', icon: 'groups' },
    { id: 'prazo', label: 'Prazo', icon: 'timer' },
    { id: 'outros', label: 'Outros', icon: 'event' }
  ];

  const toggleFilter = (filterId) => {
    setSelectedFilters((current) =>
      current.includes(filterId)
        ? current.filter((id) => id !== filterId)
        : [...current, filterId]
    );
  };

  const handleSearch = useCallback(() => {
    const termLower = searchTerm.toLowerCase().trim();
    let filtered = events;
    if (termLower) {
      filtered = filtered.filter((event) =>
        event.title?.toLowerCase().includes(termLower) ||
        event.client?.toLowerCase().includes(termLower) ||
        event.description?.toLowerCase().includes(termLower) ||
        event.location?.toLowerCase().includes(termLower)
      );
    }
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((event) =>
        selectedFilters.includes(event.type?.toLowerCase())
      );
    }
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setSearchResults(filtered);
  }, [searchTerm, selectedFilters, events]);

  useEffect(() => {
    if (searchTerm || selectedFilters.length > 0) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [events, handleSearch, searchTerm, selectedFilters]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { event });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.title}>Buscar Compromissos</Text>
        <Text style={styles.subtitle}>
          Pesquise por título, cliente, descrição ou local
        </Text>
      </View>

      <Card containerStyle={styles.searchCard}>
        <SearchBar
          placeholder="Digite sua busca..."
          onChangeText={(text) => {
            setSearchTerm(text);
            if (!text && selectedFilters.length === 0) {
              setSearchResults([]);
            }
          }}
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
                color: selectedFilters.includes(filter.id) ? 'white' : '#6200ee'
              }}
              type={selectedFilters.includes(filter.id) ? 'solid' : 'outline'}
              buttonStyle={[
                styles.filterButton,
                selectedFilters.includes(filter.id) && styles.filterButtonActive
              ]}
              titleStyle={[
                styles.filterButtonText,
                selectedFilters.includes(filter.id) && styles.filterButtonTextActive
              ]}
              onPress={() => {
                toggleFilter(filter.id);
                handleSearch();
              }}
            />
          ))}
        </View>

        <Button
          title="Buscar"
          icon={{ name: 'search', size: 20, color: 'white' }}
          buttonStyle={styles.searchButton}
          onPress={handleSearch}
          disabled={!searchTerm && selectedFilters.length === 0}
        />
      </Card>

      {searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </Text>
          {searchResults.map((event) => {
            const filterObj = filters.find((f) => f.id === event.type?.toLowerCase()) || { icon: 'event' };
            return (
              <Card key={event.id} containerStyle={styles.resultCard}>
                <TouchableOpacity onPress={() => handleEventPress(event)}>
                  <View style={styles.resultHeader}>
                    <Icon
                      name={filterObj.icon}
                      color="#6200ee"
                      size={24}
                      style={styles.resultIcon}
                    />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>{event.title}</Text>
                      <Text style={styles.resultDate}>{formatDate(event.date)}</Text>
                    </View>
                  </View>
                  {event.location && (
                    <View style={styles.resultDetail}>
                      <Icon name="location-on" size={16} color="#757575" />
                      <Text style={styles.resultDetailText}>{event.location}</Text>
                    </View>
                  )}
                  {event.client && (
                    <View style={styles.resultDetail}>
                      <Icon name="person" size={16} color="#757575" />
                      <Text style={styles.resultDetailText}>{event.client}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>
      ) : (searchTerm || selectedFilters.length > 0) ? (
        <Card containerStyle={styles.noResultsCard}>
          <Icon name="search-off" size={48} color="#757575" />
          <Text style={styles.noResultsText}>Nenhum compromisso encontrado</Text>
        </Card>
      ) : (
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
              Use palavras-chave específicas para encontrar compromissos com facilidade.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="filter-list" color="#6200ee" size={20} />
            <Text style={styles.tipText}>
              Combine filtros para refinar sua busca.
            </Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#6200ee', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { color: '#fff', marginBottom: 5 },
  subtitle: { color: '#fff', opacity: 0.8, fontSize: 16 },
  searchCard: { borderRadius: 10, marginHorizontal: 16, marginTop: -20, elevation: 4, padding: 15 },
  searchBarContainer: { backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0, padding: 0 },
  searchBarInput: { backgroundColor: '#f5f5f5' },
  filterTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#000' },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  filterButton: { borderRadius: 20, paddingHorizontal: 15, backgroundColor: 'transparent', borderColor: '#6200ee', marginBottom: 8 },
  filterButtonActive: { backgroundColor: '#6200ee' },
  filterButtonText: { color: '#6200ee', fontSize: 14 },
  filterButtonTextActive: { color: 'white' },
  searchButton: { backgroundColor: '#6200ee', borderRadius: 10, height: 50 },
  resultsContainer: { padding: 16 },
  resultsTitle: { fontSize: 16, color: '#757575', marginBottom: 8 },
  resultCard: { borderRadius: 10, marginBottom: 8, padding: 12 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  resultIcon: { backgroundColor: 'rgba(98, 0, 238, 0.1)', padding: 8, borderRadius: 20 },
  resultInfo: { marginLeft: 12, flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  resultDate: { fontSize: 14, color: '#757575' },
  resultDetail: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  resultDetailText: { marginLeft: 8, fontSize: 14, color: '#000' },
  noResultsCard: { borderRadius: 10, marginHorizontal: 16, marginTop: 16, padding: 24, alignItems: 'center' },
  noResultsText: { marginTop: 16, fontSize: 16, color: '#757575' },
  tipsCard: { borderRadius: 10, marginHorizontal: 16, marginTop: 16, marginBottom: 20, elevation: 4 },
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 18, marginLeft: 8, color: '#6200ee' },
  tipItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tipText: { marginLeft: 12, fontSize: 14, color: '#000', flex: 1 }
});

export default SearchScreen;
