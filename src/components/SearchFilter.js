import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Modal, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';

const filters = ['audiencia', 'reuniao', 'prazo', 'outros'];

const SearchFilter = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const currentTheme = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  const handleSearchSubmit = () => {
    setIsLoading(true);
    onSearch({ term: searchTerm, filters: selectedFilters });
    setTimeout(() => setIsLoading(false), 500); // Simula carregamento
  };

  const toggleFilter = (filterKey) => {
    setSelectedFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  const activeFilterCount = Object.values(selectedFilters).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: currentTheme.card, borderColor: currentTheme.primary }]}>
        <Feather name="search" size={20} color={currentTheme.primary} aria-label="Ícone de busca" />
        <TextInput
          accessibilityRole="search"
          style={[styles.searchInput, { color: currentTheme.text }]}
          placeholder="Buscar eventos (Ex: Reunião, audiência...)"
          placeholderTextColor={currentTheme.text + '60'}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <View style={styles.filterButton}>
            <Feather name="filter" size={20} color={currentTheme.primary} aria-label="Ícone de filtro" />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={isFilterModalVisible} transparent={true} animationType="slide">
        <View style={[styles.modalBackground, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.filterModal, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Filtrar Eventos</Text>
            {filters.map((filter) => (
              <TouchableOpacity key={filter} style={styles.filterOption} onPress={() => toggleFilter(filter)}>
                <Text style={{ color: currentTheme.text }}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: selectedFilters[filter] ? currentTheme.primary : 'transparent',
                      borderColor: currentTheme.primary,
                    },
                  ]}
                >
                  {selectedFilters[filter] && <Feather name="check" size={14} color="white" />}
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={{ color: currentTheme.primary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  handleSearchSubmit();
                  setFilterModalVisible(false);
                }}
              >
                <Text style={{ color: currentTheme.primary }}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
  },
});

export default SearchFilter;
