// HomeScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Dimensions } from 'react-native';
import { FAB, Card, Icon, Button, Text } from '@rneui/themed';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import { useTheme } from '../contexts/ThemeContext';
import UpcomingEvents from '../components/UpcomingEvents';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDateTime, isToday } from '../utils/dateUtils';

const { width, height } = Dimensions.get('window');

const ALERT_MESSAGES = {
  DELETE_CONFIRM: {
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir este compromisso?',
  },
  DELETE_ERROR: {
    title: 'Erro',
    message: 'Não foi possível excluir o compromisso',
  },
  OPTIONS: {
    title: 'Opções',
    message: 'O que você deseja fazer?',
  },
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { events, loading, refreshEvents, deleteEvent } = useEvents();
  const { theme, isDarkMode } = useTheme();
  const [nextEvent, setNextEvent] = useState(null);
  
  useEffect(() => {
    if (isFocused) {
      refreshEvents();
    }
  }, [isFocused, refreshEvents]);

  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      const upcoming = events
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (upcoming.length > 0) {
        setNextEvent(upcoming[0]);
      } else {
        setNextEvent(null);
      }
    } else {
      setNextEvent(null);
    }
  }, [events]);

  const handleEventPress = useCallback((event) => {
    Alert.alert(
      ALERT_MESSAGES.OPTIONS.title,
      ALERT_MESSAGES.OPTIONS.message,
      [
        { text: 'Visualizar', onPress: () => navigation.navigate('EventView', { event }) },
        { text: 'Editar', onPress: () => navigation.navigate('EventDetails', { event }) },
        { text: 'Excluir', style: 'destructive', onPress: () => confirmDelete(event) },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [navigation]);

  const confirmDelete = useCallback((event) => {
    Alert.alert(
      ALERT_MESSAGES.DELETE_CONFIRM.title,
      ALERT_MESSAGES.DELETE_CONFIRM.message,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              await refreshEvents();
            } catch (error) {
              Alert.alert(ALERT_MESSAGES.DELETE_ERROR.title, ALERT_MESSAGES.DELETE_ERROR.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [deleteEvent, refreshEvents]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    header: {
      paddingTop: 40,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginVertical: 16,
      marginLeft: 20,
    },
    welcomeCard: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      elevation: 5,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border
    },
    gradientContainer: {
      padding: 20,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#fff',
      marginBottom: 6,
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#fff',
      opacity: 0.9,
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 10,
    },
    actionButton: {
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)',
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      marginLeft: 6,
    },
    nextEventCard: {
      marginHorizontal: 20,
      marginVertical: 10,
      borderRadius: 12,
      padding: 16,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    nextEventHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    nextEventTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginLeft: 10,
    },
    nextEventContent: {
      backgroundColor: isDarkMode ? theme.colors.surfaceVariant : theme.colors.surface,
      borderRadius: 8,
      padding: 16,
      marginTop: 8,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    eventDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    eventDetailText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginLeft: 6,
    },
    noEventText: {
      fontSize: 15,
      color: theme.colors.textMuted,
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: 10,
    },
    nextEventActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
    },
    nextEventButton: {
      marginLeft: 10,
    },
    nextEventButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: theme.colors.primary,
    },
  });

  const getGradientColors = () => {
    if (isDarkMode) {
      return ['#3700B3', '#5600E8', '#7928CA'];
    } else {
      return ['#6200ee', '#6F18FF', '#7928CA'];
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Card containerStyle={styles.welcomeCard}>
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}
            >
              <Text style={styles.welcomeTitle}>Bem-vindo ao JusAgenda</Text>
              <Text style={styles.welcomeSubtitle}>Gerencie sua agenda jurídica com facilidade</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('EventDetails')}
                >
                  <Icon name="add-circle" color="#fff" size={16} />
                  <Text style={styles.actionButtonText}>Novo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('Search')}
                >
                  <Icon name="search" color="#fff" size={16} />
                  <Text style={styles.actionButtonText}>Buscar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Card>
        </View>

        {nextEvent && (
          <>
            <Text style={styles.sectionTitle}>Próximo Compromisso</Text>
            <Card containerStyle={styles.nextEventCard}>
              <View style={styles.nextEventHeader}>
                <Icon
                  name={nextEvent.type === 'audiencia' ? 'gavel' : nextEvent.type === 'reuniao' ? 'groups' : nextEvent.type === 'prazo' ? 'timer' : 'event'}
                  color={theme.colors.primary}
                  size={24}
                  style={{ backgroundColor: isDarkMode ? theme.colors.surfaceVariant : `${theme.colors.primary}15`, padding: 10, borderRadius: 8 }}
                />
                <Text style={styles.nextEventTitle}>
                  {isToday(nextEvent.date) ? 'Hoje' : 'Em breve'}
                </Text>
              </View>
              <View style={styles.nextEventContent}>
                <Text style={styles.eventTitle}>{nextEvent.title}</Text>
                <View style={styles.eventDetail}>
                  <Icon name="calendar-today" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.eventDetailText}>{formatDateTime(nextEvent.date)}</Text>
                </View>
                {nextEvent.location && (
                  <View style={styles.eventDetail}>
                    <Icon name="location-on" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.eventDetailText}>{nextEvent.location}</Text>
                  </View>
                )}
              </View>
              <View style={styles.nextEventActions}>
                <TouchableOpacity 
                  style={styles.nextEventButton}
                  onPress={() => navigation.navigate('EventView', { event: nextEvent })}
                >
                  <Text style={styles.nextEventButtonText}>Ver Detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.nextEventButton}
                  onPress={() => navigation.navigate('EventDetails', { event: nextEvent })}
                >
                  <Text style={styles.nextEventButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
        )}

        <Text style={styles.sectionTitle}>Compromissos Futuros</Text>
        <UpcomingEvents onEventPress={handleEventPress} />
      </ScrollView>

      <FAB
        icon={{ name: 'add', color: 'white' }}
        color={theme.colors.primary}
        style={styles.fab}
        onPress={() => navigation.navigate('EventDetails')}
      />
    </View>
  );
};

export default HomeScreen;
