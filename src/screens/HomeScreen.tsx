// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack'; // Para tipar a navegação
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType } from '../types/event';
import { HomeStackParamList } from '../navigation/stacks/HomeStack'; // Assumindo que tem esta tipagem
import { formatDate, formatTime, parseISO, isDateValid, addDays, isSameDay, startOfDay, endOfDay } from '../utils/dateUtils';
import { Card, Header, List, LoadingSkeleton } from '../components/ui'; // Usando componentes de UI atualizados
import { ROUTES, getEventTypeLabel, getEventStatusLabel, PRIORIDADE_LABELS } from '../constants';
import OptimizedFlatList from '../components/OptimizedFlatList'; // Usando a FlatList otimizada

// Tipagem para a prop de navegação específica desta tela
type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.HOME>;

// Interface para os itens da lista de próximos eventos
interface UpcomingEventListItem extends EventType {
  // Adicionar campos específicos para a lista, se necessário
}

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { events: allEvents, isLoading: isLoadingEventsContext, getEventsByDate } = useEvents(); // Assumindo isLoading do contexto
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const [isLoading, setIsLoading] = useState(true); // Loading local para dados iniciais da tela
  const [refreshing, setRefreshing] = useState(false);
  // const [todayEvents, setTodayEvents] = useState<EventType[]>([]); // Se quiser separar eventos de hoje

  // Simulação de carregamento de dados específicos da tela ou adicionais
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    // console.log('HomeScreen: Carregando dados iniciais...');
    // Aqui poderia buscar dados adicionais ou fazer alguma lógica específica da HomeScreen
    // Por agora, vamos apenas simular um pequeno atraso.
    // A lista de eventos já vem do EventCrudContext.
    await new Promise(resolve => setTimeout(resolve, 300)); // Pequeno atraso para UX
    setIsLoading(false);
    // console.log('HomeScreen: Dados carregados.');
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useFocusEffect(
    useCallback(() => {
      // console.log('HomeScreen: Tela focada, pode recarregar dados se necessário.');
      // Se precisar recarregar eventos sempre que a tela focar:
      // loadInitialData(); // Ou uma função de recarga mais específica
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // console.log('HomeScreen: Atualizando dados...');
    // Adicione aqui a lógica para buscar/atualizar os eventos do contexto ou de uma API
    // Ex: await refetchEventsFromContext();
    await loadInitialData(); // Simplesmente recarrega os dados por agora
    setRefreshing(false);
    // console.log('HomeScreen: Dados atualizados.');
  }, [loadInitialData]);


  const today = useMemo(() => startOfDay(new Date()), []);

  const upcomingEvents = useMemo(() => {
    const sevenDaysFromNow = endOfDay(addDays(today, 7));
    return allEvents
      .filter(e => {
        if (!e.data || typeof e.data !== 'string') return false;
        try {
          const eventDate = parseISO(e.data); // `e.data` deve ser 'YYYY-MM-DD'
          return isDateValid(eventDate) && eventDate >= today && eventDate <= sevenDaysFromNow;
        } catch (error) {
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = parseISO(a.data).getTime();
        const dateB = parseISO(b.data).getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        // Se as datas forem iguais, ordena pela hora (se existir)
        const timeA = a.hora ? a.hora.replace(':', '') : '0000';
        const timeB = b.hora ? b.hora.replace(':', '') : '0000';
        return timeA.localeCompare(timeB);
      });
  }, [allEvents, today]);

  const nextEvent = useMemo(() => {
    return upcomingEvents.find(event => {
        if (!event.data) return false;
        const eventDate = parseISO(event.data);
        // Considera o próximo evento como o primeiro de hoje ou de um dia futuro
        return eventDate >= today;
    }) || null;
  }, [upcomingEvents, today]);


  const navigateToEventDetails = (eventId?: string, initialDateString?: string, isReadOnly?: boolean) => {
    navigation.navigate(ROUTES.EVENT_DETAILS, { eventId, initialDateString, readOnly: isReadOnly });
  };

  // const navigateToEventView = (event: EventType) => { // Removed
  //   navigation.navigate(ROUTES.EVENT_VIEW, { eventId: event.id, eventTitle: event.title });
  // };

  const renderEventCard = (event: EventType, isNextEventCard: boolean = false) => {
    if (!event) return null;

    const eventDateObj = event.data ? parseISO(event.data) : null;
    const displayDate = eventDateObj && isDateValid(eventDateObj) ? formatDate(eventDateObj, 'dd/MM/yyyy') : 'Data inválida';
    const displayTime = event.hora || (event.isAllDay ? 'Dia Todo' : 'Hora não definida');

    return (
      <Card
        key={event.id}
        style={[styles.eventCard, isNextEventCard ? styles.nextEventCardHighlight : {}]}
        onPress={() => navigateToEventDetails(event.id, undefined, true)} // Updated to use navigateToEventDetails with readOnly: true
        elevation={isNextEventCard ? 'md' : 'sm'}
      >
        <Text style={[styles.eventTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          {event.title}
        </Text>
        <View style={styles.eventDetailRow}>
          <MaterialCommunityIcons name="calendar-month-outline" size={16} color={theme.colors.primary} style={styles.iconStyle} />
          <Text style={[styles.eventDetailText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
            {displayDate} às {displayTime}
          </Text>
        </View>
        {event.local && (
          <View style={styles.eventDetailRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.colors.primary} style={styles.iconStyle} />
            <Text style={[styles.eventDetailText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
              {event.local}
            </Text>
          </View>
        )}
        {event.eventType && (
          <View style={styles.eventDetailRow}>
            <MaterialCommunityIcons name="tag-outline" size={16} color={theme.colors.primary} style={styles.iconStyle} />
            <Text style={[styles.eventDetailText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
              {getEventTypeLabel(event.eventType)}
            </Text>
          </View>
        )}
         {event.prioridade && (
          <View style={styles.eventDetailRow}>
            <MaterialCommunityIcons name="priority-high" size={16} color={theme.colors.warning} style={styles.iconStyle} />
            <Text style={[styles.eventDetailText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}>
              Prioridade: {PRIORIDADE_LABELS[event.prioridade] || event.prioridade}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  if (isLoading && !refreshing) { // Mostra skeleton apenas no carregamento inicial
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
        <Header title="JusAgenda" />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <LoadingSkeleton layout="custom" style={{ padding: theme.spacing.md }}>
            {/* Skeleton para "Próximo Evento" */}
            <View style={{ marginBottom: theme.spacing.lg }}>
                <SkeletonPlaceholderItem width="60%" height={24} style={{ marginBottom: theme.spacing.sm }} />
                <SkeletonPlaceholderItem width="100%" height={120} borderRadius={theme.radii.md} />
            </View>
            {/* Skeleton para "Próximos 7 Dias" */}
            <SkeletonPlaceholderItem width="50%" height={22} style={{ marginBottom: theme.spacing.sm }} />
            <SkeletonPlaceholderItem width="100%" height={80} borderRadius={theme.radii.md} style={{ marginBottom: theme.spacing.sm }}/>
            <SkeletonPlaceholderItem width="100%" height={80} borderRadius={theme.radii.md} />
          </LoadingSkeleton>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
      <Header
        title="JusAgenda"
        // Exemplo de rightComponent
        // rightComponent={
        //   <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SETTINGS)}>
        //     <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
        //   </TouchableOpacity>
        // }
      />
      <OptimizedFlatList<UpcomingEventListItem>
        data={upcomingEvents} // Passa todos os eventos dos próximos 7 dias
        renderItem={({ item }) => renderEventCard(item, item.id === nextEvent?.id)}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {nextEvent ? (
              <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md }}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                  Próximo Evento
                </Text>
                {/* O próximo evento já será renderizado como o primeiro item da lista se a lógica estiver correta */}
              </View>
            ) : (
              !isLoadingEventsContext && upcomingEvents.length === 0 && ( // Mostra apenas se não estiver carregando e não houver eventos
                <View style={[styles.centeredMessageContainer, { padding: theme.spacing.md }]}>
                  <MaterialCommunityIcons name="calendar-check-outline" size={48} color={theme.colors.placeholder} />
                  <Text style={[styles.noEventsText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
                    Nenhum evento agendado para os próximos 7 dias.
                  </Text>
                </View>
              )
            )}
            {upcomingEvents.length > 0 && (
                 <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: nextEvent ? theme.spacing.sm : theme.spacing.md, paddingBottom: theme.spacing.xs }}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
                        {nextEvent ? 'Outros Eventos (Próximos 7 Dias)' : 'Eventos (Próximos 7 Dias)'}
                    </Text>
                </View>
            )}
          </>
        }
        ListEmptyComponent={ // Será mostrado se `upcomingEvents` estiver vazio E `nextEvent` for null
          !isLoadingEventsContext && !nextEvent && ( // Condição duplicada, mas garante
            <View style={[styles.centeredMessageContainer, { padding: theme.spacing.md, marginTop: theme.spacing.xl }]}>
               <MaterialCommunityIcons name="calendar-alert" size={48} color={theme.colors.placeholder} />
              <Text style={[styles.noEventsText, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
                Parece que sua agenda está livre!
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        // Outras props do OptimizedFlatList, se necessário
      />

      {/* Botão Flutuante para Adicionar Evento */}
      {/* Condition !isReadOnly removed as isReadOnly is not defined in this scope */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigateToEventDetails(undefined, today.toISOString().split('T')[0], false)} // Explicitly set readOnly: false for new event
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color={theme.colors.white || '#ffffff'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80, // Espaço para o FAB não sobrepor o último item
    paddingHorizontal: Platform.OS === 'web' ? 16 : 0, // Padding horizontal apenas na web
  },
  sectionTitle: {
    fontSize: 20, // Usar theme.typography
    // fontWeight e fontFamily são dinâmicos
    // marginBottom e paddingHorizontal são dinâmicos
  },
  eventCard: {
    marginHorizontal: 16, // Usar theme.spacing.md
    marginVertical: 8,   // Usar theme.spacing.sm
  },
  nextEventCardHighlight: {
    borderColor: Platform.OS === 'android' ? undefined : '#FFD700', // Destaque para Android pode ser com elevation
    borderWidth: Platform.OS === 'android' ? 1 : 2, // Borda mais sutil no Android se elevation estiver presente
    // backgroundColor: theme.colors.surface, // Pode querer um fundo ligeiramente diferente
  },
  eventTitle: {
    fontSize: 18, // Usar theme.typography
    // fontWeight e fontFamily são dinâmicos
    marginBottom: 8, // Usar theme.spacing.sm
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4, // Usar theme.spacing.xs
  },
  iconStyle: {
    marginRight: 8, // Usar theme.spacing.sm
  },
  eventDetailText: {
    fontSize: 14, // Usar theme.typography
    // fontFamily é dinâmico
    flexShrink: 1, // Para quebrar linha se o texto for longo
  },
  centeredMessageContainer: {
    flex: 1, // Para centralizar se for o único item (via ListEmptyComponent)
    justifyContent: 'center',
    alignItems: 'center',
    // padding é dinâmico
    minHeight: 200, // Altura mínima para o container da mensagem
  },
  noEventsText: {
    fontSize: 16, // Usar theme.typography
    marginTop: 16, // Usar theme.spacing.md
    textAlign: 'center',
    // fontFamily é dinâmico
  },
  fab: {
    position: 'absolute',
    margin: 16, // Usar theme.spacing.md
    right: 0,
    bottom: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default HomeScreen;
