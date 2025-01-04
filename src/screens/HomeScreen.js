import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { darkTheme } from '../constants/colors';
import { translate } from '../utils/translations';
import UpcomingEvents from '../components/UpcomingEvents';
import SearchFilter from '../components/SearchFilter';

const HomeScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentTheme = darkTheme;

  const refresh = route.params?.refresh || false;

  const eventTypes = [
    { id: 'audiencia', label: translate(language, 'eventTypes.hearing') },
    { id: 'reuniao', label: translate(language, 'eventTypes.meeting') },
    { id: 'prazo', label: translate(language, 'eventTypes.deadline') },
    { id: 'outros', label: translate(language, 'eventTypes.other') },
  ];

  const handleNavigateToCreateEvent = (type) => {
    console.log('Navigating to EventCreate with type:', type); // Debug
    navigation.navigate('EventCreate', { eventType: type });
  };

  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        console.log('Atualizando eventos...');
        // Aqui você pode forçar a atualização dos eventos em UpcomingEvents
        navigation.setParams({ refresh: false }); // Reseta o parâmetro após o refresh
      }
    }, [refresh, navigation])
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: currentTheme.text }]}>JusAgenda</Text>
      </View>

      <SearchFilter
        onSearch={({ term, filters }) => {
          navigation.navigate('SearchResults', { term, filters });
        }}
      />

      <UpcomingEvents />

      <Text style={[styles.sectionHeader, { color: currentTheme.text }]}>Tipos de Evento</Text>
      <FlatList
        data={eventTypes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={() => handleNavigateToCreateEvent(item.id)}
          >
            <Text style={[styles.buttonText, { color: currentTheme.card }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.buttonGroup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  headerContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  buttonGroup: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
