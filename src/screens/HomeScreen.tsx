import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Card, Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { Event } from '../types/event';
import { useEvents } from '../contexts/EventCrudContext';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

import { format, startOfDay, endOfDay, addDays, parseISO, isValid as isDateValid } from 'date-fns';
import { formatDate as formatDateUtil } from '../utils/dateUtils';

type HomeStackParamList = {
  Home: undefined;
  EventDetails: { eventId?: string; event?: Event };
  EventView: { eventId: string };
};
type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();
  const { events } = useEvents();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      if (events.length > 0 || !isLoading) {
          setIsLoading(false);
          return;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
    };
    loadInitialData();
  }, [events, isLoading]);


  const calculatedNextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    try {
      const sortedEvents = [...events]
        .filter(e => e.data && typeof e.data === 'string' && isDateValid(parseISO(e.data)))
        .map(e => ({ ...e, dateObj: parseISO(e.data) }))
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      return sortedEvents.find(e => e.data >= todayStr) || null;
    } catch (error) {
      console.error("Error calculating next event:", error);
      return null;
    }
  }, [events]);

  const upcomingEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    try {
      const today = startOfDay(new Date());
      const sevenDaysLater = endOfDay(addDays(today, 7));

      return events
        .filter(e => {
          if (!e.data || typeof e.data !== 'string') return false;
          const eventDate = parseISO(e.data);
          return isDateValid(eventDate) && eventDate >= today && eventDate <= sevenDaysLater;
        })
        .sort((a, b) => {
            const dateA = parseISO(a.data!).getTime();
            const dateB = parseISO(b.data!).getTime();
            if (dateA !== dateB) return dateA - dateB;
            if (a.hora && b.hora) {
                return a.hora.localeCompare(b.hora);
            }
            return 0;
        });
    } catch (error) {
      console.error("Error calculating upcoming events:", error);
      return [];
    }
  }, [events]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    console.log("Pull to refresh acionado - atualizando UI com estado em memória.");
    try {
        await new Promise(resolve => setTimeout(resolve, 600));
    } catch (error) {
        console.error("Erro durante o refresh simulado:", error);
        Toast.show({type: 'error', text1: 'Erro ao atualizar'});
    } finally {
        setIsRefreshing(false);
    }
  }, []);

  const navigateToEventDetails = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id, event: event });
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>Carregando agenda...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {calculatedNextEvent ? (
        <TouchableOpacity onPress={() => navigateToEventDetails(calculatedNextEvent)}>
            <Card containerStyle={[styles.card, styles.nextEventCard, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
            <View style={styles.nextEventHeader}>
                <Icon name="star" type="material-community" color={theme.colors.onPrimary} size={20} />
                <Card.Title style={[styles.nextEventCardTitle, { color: theme.colors.onPrimary }]}>
                    Próximo Evento
                </Card.Title>
            </View>
            <Card.Divider color={theme.colors.onPrimary} style={styles.cardDividerWithOpacity} />
            <Text style={[styles.nextEventTitle, { color: theme.colors.onPrimary }]}>
                {calculatedNextEvent.title}
            </Text>
            <Text style={[styles.nextEventDetails, styles.nextEventDetailsOpacity, { color: theme.colors.onPrimary }]}>
                {formatDateUtil(calculatedNextEvent.data, 'dd/MM/yyyy')}
                {calculatedNextEvent.hora ? ` às ${calculatedNextEvent.hora}` : ''}
            </Text>
            {calculatedNextEvent.local && (
                <Text style={[styles.nextEventDetails, styles.nextEventDetailsOpacity, { color: theme.colors.onPrimary }]}>
                Local: {calculatedNextEvent.local}
                </Text>
            )}
            </Card>
        </TouchableOpacity>
      ) : (
        <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.emptyMessageContainerCentered}>
                <Icon name="calendar-today" type="material-community" size={30} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary, marginTop: theme.spacing.sm }]}>
                    Nenhum evento próximo agendado.
                </Text>
            </View>
        </Card>
      )}

      <Text style={[
            styles.sectionTitle,
            { color: theme.colors.text, marginTop: theme.spacing.lg }
      ]}>
        Eventos nos Próximos 7 Dias
      </Text>
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map(event => (
          <TouchableOpacity
            key={event.id}
            onPress={() => navigateToEventDetails(event)}
            style={styles.eventTouchable}
          >
            <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.eventItemTitle, { color: theme.colors.text }]}>{event.title}</Text>
              <Text style={[styles.eventItemDetails, { color: theme.colors.textSecondary }]}>
                {formatDateUtil(event.data, 'EEEE, dd/MM/yyyy')}
                {event.hora ? ` - ${event.hora}` : ''}
              </Text>
              {event.local && (
                <Text style={[styles.eventItemDetails, styles.eventItemLocalText, { color: theme.colors.textSecondary }]}>
                  <Icon name="map-marker-outline" type="material-community" size={14} color={theme.colors.textSecondary} /> {event.local}
                </Text>
              )}
            </Card>
          </TouchableOpacity>
        ))
      ) : ( // O erro de parsing estava aqui, o parêntese extra foi removido.
            <View style={styles.emptyMessageContainer}>
                <Icon name="calendar-check-outline" type="material-community" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
                    Nenhum evento agendado para os próximos 7 dias.
                </Text>
            </View>
        // O parêntese extra foi removido daqui.
      )}
        <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardDividerWithOpacity: {
    opacity: 0.5,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  emptyMessage: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
    paddingVertical: 50,
  },
  emptyMessageContainerCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  eventItemDetails: {
    fontSize: 14,
  },
  eventItemLocalText: {
    fontSize: 13,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  eventTouchable: {
    // Estilos para o TouchableOpacity se necessário
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  nextEventCard: {
    // Estilos específicos
  },
  nextEventCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  nextEventDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  nextEventDetailsOpacity: {
    opacity: 0.9,
  },
  nextEventHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  nextEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});

export default HomeScreen;
