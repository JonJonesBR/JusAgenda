// src/components/SearchFilter.js
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Text 
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../constants/colors';
import { Feather } from '@expo/vector-icons';

const SearchFilter = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    audiencia: false,
    reuniao: false,
    prazo: false,
    outros: false
  });

  const { theme } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const handleSearch = () => {
    onSearch({
      term: searchTerm,
      filters: selectedFilters
    });
  };

  const toggleFilter = (filterKey) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchContainer, 
        { 
          backgroundColor: currentTheme.card,
          borderColor: currentTheme.primary
        }
      ]}>
        <Feather 
          name="search" 
          size={20} 
          color={currentTheme.primary} 
        />
        <TextInput
          style={[
            styles.searchInput, 
            { color: currentTheme.text }
          ]}
          placeholder="Buscar eventos..."
          placeholderTextColor={currentTheme.text + '60'}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          onPress={() => setFilterModalVisible(true)}
        >
          <Feather 
            name="filter" 
            size={20} 
            color={currentTheme.primary} 
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={[
            styles.filterModal, 
            { backgroundColor: currentTheme.card }
          ]}>
            <Text style={[
              styles.modalTitle, 
              { color: currentTheme.text }
            ]}>
              Filtrar Eventos
            </Text>

            {Object.entries(selectedFilters).map(([key, value]) => (
              <TouchableOpacity 
                key={key}
                style={styles.filterOption}
                onPress={() => toggleFilter(key)}
              >
                <Text style={{ color: currentTheme.text }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <View style={[
                  styles.checkbox,
                  { 
                    backgroundColor: value ? currentTheme.primary : 'transparent',
                    borderColor: currentTheme.primary 
                  }
                ]}>
                  {value && (
                    <Feather 
                      name="check" 
                      size={14} 
                      color="white" 
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={{ color: currentTheme.primary }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  handleSearch();
                  setFilterModalVisible(false);
                }}
              >
                <Text style={{ color: currentTheme.primary }}>
                  Aplicar
                </Text>
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
    marginBottom: 15
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  filterModal: {
    width: '80%',
    padding: 20,
    borderRadius: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },
  modalButton: {
    padding: 10
  }
});

export default SearchFilter;