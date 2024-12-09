import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { lightTheme, darkTheme } from '../constants/colors';
import { translate } from '../utils/translations';
import UpcomingEvents from '../components/UpcomingEvents';
import SearchFilter from '../components/SearchFilter';

const HomeScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const eventTypes = [
    { id: 'hearing', label: translate(language, 'eventTypes.hearing') },
    { id: 'meeting', label: translate(language, 'eventTypes.meeting') },
    { id: 'deadline', label: translate(language, 'eventTypes.deadline') },
    { id: 'other', label: translate(language, 'eventTypes.other') },
  ];

  const handleNavigateToCreateEvent = (type) => {
    navigation.navigate('EventCreate', { eventType: type });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: currentTheme.text }]}>JusAgenda</Text>
        <View style={styles.actionButtons}>
          {/* Botão para alternar tema */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
            onPress={toggleTheme}
          >
            <Text style={styles.actionButtonText}>
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </Text>
          </TouchableOpacity>

          {/* Botão para alternar idioma */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
            onPress={toggleLanguage}
          >
            <Text style={styles.actionButtonText}>
              {language === 'pt-BR' ? 'English' : 'Português'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtro de pesquisa */}
      <SearchFilter
        onSearch={(filters) => {
          navigation.navigate('SearchResults', { filters });
        }}
      />

      {/* Eventos futuros */}
      <UpcomingEvents />

      {/* Botões de tipos de evento */}
      <Text style={[styles.sectionHeader, { color: currentTheme.text }]}>
        {translate(language, 'home.eventTypesTitle')}
      </Text>
      <View style={styles.buttonGroup}>
        {eventTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={() => handleNavigateToCreateEvent(type.id)}
          >
            <Text style={[styles.buttonText, { color: currentTheme.card }]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexBasis: '48%',
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
