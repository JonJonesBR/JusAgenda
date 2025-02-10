import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { lightTheme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';

// Lista dos tipos de eventos (sem acentos) para compatibilidade com os dados salvos
const filters = ['audiencia', 'reuniao', 'prazo', 'outros'];

const SearchFilter = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  // Processa a busca e aplica os filtros selecionados
  const handleSearchSubmit = () => {
    const activeFilters = Object.keys(selectedFilters).filter(
      (key) => selectedFilters[key]
    );

    const searchParams = {
      term: searchTerm.trim(),
      filters: activeFilters,
    };

    onSearch(searchParams);
  };

  // Alterna o estado (ligado/desligado) de um filtro específico
  const toggleFilter = (filterKey) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  // Quantifica os filtros atualmente ativos
  const activeFilterCount = Object.values(selectedFilters).filter(Boolean)
    .length;

  // Retorna o rótulo formatado com acento para exibição
  const getFilterLabel = (filter) => {
    const labels = {
      audiencia: 'Audiência',
      reuniao: 'Reunião',
      prazo: 'Prazo',
      outros: 'Outros',
    };
    return labels[filter] || filter;
  };

  return (
    <View style={styles.container}>
      {/* Campo de busca */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: lightTheme.card, borderColor: lightTheme.primary },
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
          placeholderTextColor={lightTheme.text + '60'}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearchSubmit}
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
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterItem,
                  selectedFilters[filter] && {
                    backgroundColor: lightTheme.primary + '20',
                  },
                ]}
                onPress={() => toggleFilter(filter)}
              >
                <Text style={[styles.filterText, { color: lightTheme.text }]}>
                  {getFilterLabel(filter)}
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
              style={[styles.applyButton, { backgroundColor: lightTheme.primary }]}
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
  },
});

export default SearchFilter;
