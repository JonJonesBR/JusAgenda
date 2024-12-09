import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { lightTheme, darkTheme } from '../constants/colors';
import { translate } from '../utils/translations';
import UpcomingEvents from '../components/UpcomingEvents';
import SearchFilter from '../components/SearchFilter';

/**
 * Tela inicial do aplicativo.
 * @param {Object} props
 * @param {Function} props.navigation - Navegação do React Navigation.
 */
const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const eventTypes = [
    { id: 'hearing', label: translate(language, 'eventTypes.hearing') },
    { id: 'meeting', label: translate(language, 'eventTypes.meeting') },
    { id: 'deadline', label: translate(language, 'eventTypes.deadline') },
    { id: 'other', label: translate(language, 'eventTypes.other') },
  ];

  /**
   * Navega para a tela de criação de evento.
   * @param {string} type - Tipo de evento.
   */
  const handleNavigateToCreateEvent = (type) => {
    navigation.navigate('EventCreate', { eventType: type });
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Título da página */}
      <Text style={[styles.header, { color: currentTheme.text }]}>
        {translate(language, 'home.title')}
      </Text>

      {/* Filtro de pesquisa */}
      <SearchFilter
        onSearch={(filters) => {
          navigation.navigate('SearchResults', { filters });
        }}
      />

      {/* Eventos futuros */}
      <UpcomingEvents />

      {/* Botões de navegação para tipos de evento */}
      <View style={styles.buttonGroup}>
        {eventTypes.map((type) => (
          <TouchableOpacity
            key={type.id} // Usa o ID como chave
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={() => handleNavigateToCreateEvent(type.id)}
          >
            <Text style={[styles.buttonText, { color: currentTheme.card }]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flexBasis: '48%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
