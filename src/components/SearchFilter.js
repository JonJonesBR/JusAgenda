import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';
import { lightTheme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';

/**
 * Available filter types for events
 * @type {string[]}
 */
const FILTERS = ['audiencia', 'reuniao', 'prazo', 'outros'];

/**
 * Display labels for filter types in Portuguese
 * @type {Object.<string, string>}
 */
const FILTER_LABELS = {
  audiencia: 'Audiência',
  reuniao: 'Reunião',
  prazo: 'Prazo',
  outros: 'Outros',
};

/**
 * A search component with filter functionality for events
 * Provides a search input field and a modal filter selector
 *
 * @component
 * @example
 * <SearchFilter
 *   onSearch={({ term, filters }) => {
 *     console.log('Search term:', term);
 *     console.log('Active filters:', filters);
 *   }}
 * />
 *
 * @typedef {Object} SearchParams
 * @property {string} term - The search text entered by the user
 * @property {string[]} filters - Array of active filter types
 *
 * @param {Object} props - Component props
 * @param {(params: SearchParams) => void} props.onSearch - Callback function when search is performed
 */
const SearchFilter = ({ onSearch }) => {
  /**
   * State for managing search input and filters
   */
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  /**
   * Handles search submission by collecting active filters and search term
   * @type {() => void}
   */
  const handleSearchSubmit = useCallback(() => {
    const activeFilters = Object.keys(selectedFilters).filter(
      key => selectedFilters[key]
    );
    onSearch({ term: searchTerm.trim(), filters: activeFilters });
  }, [selectedFilters, searchTerm, onSearch]);

  /**
   * Toggles the state of a filter
   * @param {string} filterKey - The key of the filter to toggle
   */
  const toggleFilter = useCallback((filterKey) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  }, []);

  /**
   * Memoized count of active filters
   * @type {number}
   */
  const activeFilterCount = useMemo(
    () => Object.values(selectedFilters).filter(Boolean).length,
    [selectedFilters]
  );

  return (
    <View style={styles.container}>
      {/* Campo de busca */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: lightTheme.card,
            borderColor: lightTheme.primary,
          },
        ]}
      >
        <Feather
          name="search"
          size={20}
          color={lightTheme.primary}
          accessibilityLabel="Ícone de busca"
        />
        <TextInput
          accessibilityRole="search"
          style={[styles.searchInput, { color: lightTheme.text }]}
          placeholder="Buscar compromissos (Ex: Reunião, audiência...)"
          placeholderTextColor={`${lightTheme.text}60`}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {/* Botão para abrir o modal de filtros */}
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <View style={styles.filterButton}>
            <Feather
              name="filter"
              size={20}
              color={lightTheme.primary}
              accessibilityLabel="Ícone de filtro"
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal para seleção dos filtros */}
      <Modal
        animationType="slide"
        transparent
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: lightTheme.card }]}
          >
            <Text style={[styles.modalTitle, { color: lightTheme.text }]}>
              Filtrar por tipo
            </Text>
            {FILTERS.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterItem,
                  selectedFilters[filter] && {
                    backgroundColor: `${lightTheme.primary}20`,
                  },
                ]}
                onPress={() => toggleFilter(filter)}
              >
                <Text style={[styles.filterText, { color: lightTheme.text }]}>
                  {FILTER_LABELS[filter]}
                </Text>
                {selectedFilters[filter] && (
                  <Feather
                    name="check"
                    size={20}
                    color={lightTheme.primary}
                    accessibilityLabel="Filtro selecionado"
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.applyButton,
                { backgroundColor: lightTheme.primary },
              ]}
              onPress={() => {
                setFilterModalVisible(false);
                handleSearchSubmit();
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

SearchFilter.propTypes = {
  onSearch: PropTypes.func.isRequired,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
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
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  filterText: {
    fontSize: 16,
  },
  applyButton: {
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SearchFilter;
