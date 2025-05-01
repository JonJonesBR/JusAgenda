// HomeScreen.tsx
import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
// Usando View direto do react-native em vez do componente otimizado
// até que o problema de importação seja resolvido
import type { Event, EventContextType } from "../types/event";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";

import { useIsFocused, useNavigation } from "@react-navigation/native";
import { FAB, Button, Card, Icon } from "@rneui/themed";
import { useTheme } from "../contexts/ThemeContext";
import { useEvents } from "../contexts/EventContext";
import { LinearGradient } from "expo-linear-gradient";
import UpcomingEvents from "../components/UpcomingEvents";
import { formatDateTime } from "../utils/dateUtils";

// Tipagem para RootStackParamList
type RootStackParamList = {
  Home: undefined;
  EventDetails: { event?: Event; editMode: boolean };
  Search: undefined;
  Calendar: undefined;
};

const ALERT_MESSAGES = {
  DELETE_CONFIRM: {
    title: "Confirmar Exclusão",
    message: "Tem certeza que deseja excluir este compromisso?",
  },
  DELETE_ERROR: {
    title: "Erro",
    message: "Não foi possível excluir o compromisso",
  },
  OPTIONS: {
    title: "Opções",
    message: "O que você deseja fazer?",
  },
};

console.log('DEBUG HomeScreen.tsx: HomeScreen carregado, NODE_ENV=', process.env.NODE_ENV);
const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const { events, deleteEvent, refreshEvents: getEvents } = useEvents() as EventContextType;
  const { theme, isDarkMode } = useTheme();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdatedRef = useRef<Date>(new Date(0));

  // Função para atualizar eventos
  const refreshEvents = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await getEvents();
      lastUpdatedRef.current = new Date();
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar eventos");
    } finally {
      setIsRefreshing(false);
    }
  }, [getEvents]);
  
  // Verificar se precisamos atualizar eventos quando a tela for focada
  useEffect(() => {
    // Se a tela está em foco, atualizamos os eventos, mas apenas se não tivermos dados
    if (isFocused) {
      // Performance: só carrega se não houver eventos ou se a última atualização foi há mais de 5 minutos
      const lastUpdateTime = lastUpdatedRef.current;
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      if (lastUpdateTime < fiveMinutesAgo) {
        console.log('[Performance] Refreshing events due to stale data');
        refreshEvents();
      } else {
        console.log('[Performance] Skipping refresh - data is fresh');
      }
    }
  }, [isFocused, refreshEvents]);

  // Calcular o próximo evento com memoização para evitar cálculos repetidos
  const calculatedNextEvent = useMemo(() => {
    // Evitar cálculos desnecessários se não há eventos
    if (events.length === 0) return null;
    
    const startTime = performance.now();
    const now = new Date();
    
    // Encontrar o próximo evento com uma única iteração em vez de filter + sort
    let closestEvent = null;
    let closestTime = Number.MAX_SAFE_INTEGER;
    
    for (const event of events) {
      try {
        const eventDate = new Date(event.data);
        if (isNaN(eventDate.getTime())) continue;
        
        if (eventDate >= now) {
          const timeDiff = eventDate.getTime() - now.getTime();
          if (timeDiff < closestTime) {
            closestTime = timeDiff;
            closestEvent = event;
          }
        }
      } catch (error) {
        // Ignorar eventos com datas inválidas
        console.warn(`Invalid date in event ${event.id}`, error);
      }
    }
    
    // Log de performance apenas se demorar mais de 5ms
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    if (processingTime > 5) {
      console.log(`[Performance] Next event calculation took ${processingTime.toFixed(2)}ms for ${events.length} events`);
    }
    
    return closestEvent;
  }, [events]);  // Depende apenas dos eventos
  
  // Atualiza o estado apenas quando o evento calculado mudar
  useEffect(() => {
    setNextEvent(calculatedNextEvent);
  }, [calculatedNextEvent]);

  const handleEventPress = useCallback(
    (event: Event) => {
      Alert.alert(
        ALERT_MESSAGES.OPTIONS.title,
        ALERT_MESSAGES.OPTIONS.message,
        [
          {
            text: "Visualizar",
            onPress: () => navigation.navigate("EventDetails", { event, editMode: false }),
          },
          {
            text: "Editar",
            onPress: () => navigation.navigate("EventDetails", { event, editMode: true }),
          },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => confirmDelete(event),
          },
          { text: "Cancelar", style: "cancel" },
        ],
        { cancelable: true }
      );
    },
    [navigation]
  );

  const confirmDelete = useCallback(
    (event: Event) => {
      Alert.alert(
        ALERT_MESSAGES.DELETE_CONFIRM.title,
        ALERT_MESSAGES.DELETE_CONFIRM.message,
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteEvent(event.id);
                await refreshEvents();
              } catch (error) {
                Alert.alert(
                  ALERT_MESSAGES.DELETE_ERROR.title,
                  ALERT_MESSAGES.DELETE_ERROR.message
                );
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [deleteEvent, refreshEvents]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f2f2f7",
    },
    header: {
      paddingTop: 20,
      paddingBottom: 10,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginVertical: 16,
      marginLeft: 16,
    },
    welcomeCard: {
      borderRadius: 12,
      padding: 0,
      margin: 16,
      marginBottom: 8,
      elevation: 3,
    },
    gradientContainer: {
      borderRadius: 12,
      padding: 20,
    },
    welcomeTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 8,
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: "#fff",
      opacity: 0.9,
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: "row",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    actionButtonText: {
      color: "#fff",
      marginLeft: 8,
      fontWeight: "600",
    },
    nextEventCard: {
      borderRadius: 12,
      margin: 16,
      marginTop: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      elevation: 2,
    },
    nextEventHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    nextEventTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 8,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 12,
    },
    nextEventContent: {
      marginBottom: 16,
    },
    eventDetail: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    eventDetailText: {
      fontSize: 14,
      color: "#666",
      marginLeft: 8,
    },
    nextEventActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },
    nextEventButton: {
      marginLeft: 10,
    },
    nextEventButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "500",
    },
    emptyNextEvent: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      marginTop: 10,
    },
    emptyNextEventText: {
      fontSize: 16,
      color: "#666",
      textAlign: "center",
      marginVertical: 16,
      marginBottom: 24,
    },
    eventTypeTag: {
      backgroundColor: "rgba(33, 150, 243, 0.1)",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 16,
      alignSelf: "flex-start",
    },
    eventTypeText: {
      fontSize: 12,
      color: "#2196F3",
      fontWeight: "500",
    },
    nextEventDate: {
      fontSize: 14,
      color: "#757575",
      fontWeight: "500",
    },
    nextEventDetail: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    nextEventText: {
      fontSize: 14,
      color: "#666",
      marginLeft: 8,
    },
    noEventText: {
      fontSize: 16,
      color: "#666",
      textAlign: "center",
      marginVertical: 24,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: theme.colors.primary,
    },
  });

  // Componente memoizado para o card de boas-vindas
  const WelcomeCard = memo(({ onAddPress, onSearchPress }: { 
    onAddPress: () => void; 
    onSearchPress: () => void; 
  }) => (
    <Card containerStyle={styles.welcomeCard}>
      <LinearGradient
        colors={[
          theme.colors.primary,
          isDarkMode ? "#222266" : "#4444aa",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <Text style={styles.welcomeTitle}>Bem-vindo ao JusAgenda</Text>
        <Text style={styles.welcomeSubtitle}>
          Gerencie seus compromissos jurídicos
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAddPress}
          >
            <Icon name="add" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Novo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onSearchPress}
          >
            <Icon name="search" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Card>
  ));
  
  // Componente memoizado para o próximo evento
  const NextEventCard = memo(({ event, onViewDetails, onEdit }: {
    event: Event | null;
    onViewDetails: (event: Event) => void;
    onEdit: (event: Event) => void;
  }) => {
    if (!event) {
      return (
        <Card containerStyle={styles.nextEventCard}>
          <Text style={styles.sectionTitle}>Próximo Compromisso</Text>
          <View style={styles.emptyNextEvent}>
            <Icon
              name="event-available"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyNextEventText}>
              Você não tem compromissos futuros agendados
            </Text>
            <Button
              title="Adicionar Compromisso"
              icon={{
                name: "add",
                size: 16,
                color: "white",
              }}
              buttonStyle={{
                backgroundColor: theme.colors.primary,
                borderRadius: 8,
              }}
              onPress={() => navigation.navigate("EventDetails", { editMode: true })}
            />
          </View>
        </Card>
      );
    }
    
    return (
      <Card containerStyle={styles.nextEventCard}>
        <Text style={styles.sectionTitle}>Próximo Compromisso</Text>
        <View style={styles.nextEventHeader}>
          <View style={styles.eventTypeTag}>
            <Text style={styles.eventTypeText}>
              {event.tipo?.charAt(0).toUpperCase() +
                event.tipo?.slice(1) || "Compromisso"}
            </Text>
          </View>
          <Text style={styles.nextEventDate}>
            {formatDateTime(event.data)}
          </Text>
        </View>
        <Text style={styles.nextEventTitle}>{event.title}</Text>
        {event.local && (
          <View style={styles.nextEventDetail}>
            <Icon name="location-on" size={16} color="#757575" />
            <Text style={styles.nextEventText}>{event.local}</Text>
          </View>
        )}
        {event.cliente && (
          <View style={styles.nextEventDetail}>
            <Icon name="person" size={16} color="#757575" />
            <Text style={styles.nextEventText}>{event.cliente}</Text>
          </View>
        )}
        <View style={styles.nextEventActions}>
          <Button
            title="Ver Detalhes"
            type="outline"
            buttonStyle={styles.nextEventButton}
            titleStyle={{
              color: theme.colors.primary,
              fontSize: 14,
            }}
            icon={{
              name: "visibility",
              size: 16,
              color: theme.colors.primary,
            }}
            onPress={() => onViewDetails(event)}
          />
          <Button
            title="Editar"
            type="clear"
            buttonStyle={styles.nextEventButton}
            titleStyle={{
              color: theme.colors.primary,
              fontSize: 14,
            }}
            icon={{
              name: "edit",
              size: 16,
              color: theme.colors.primary,
            }}
            onPress={() => onEdit(event)}
          />
        </View>
      </Card>
    );
  });
  
  // Handlers memoizados para evitar re-renders desnecessários
  const handleAddPress = useCallback(() => {
    navigation.navigate("EventDetails", { editMode: true });
  }, [navigation]);
  
  const handleSearchPress = useCallback(() => {
    navigation.navigate("Search");
  }, [navigation]);
  
  const handleViewDetails = useCallback((event: Event) => {
    navigation.navigate("EventDetails", {
      event,
      editMode: false,
    });
  }, [navigation]);
  
  const handleEdit = useCallback((event: Event) => {
    navigation.navigate("EventDetails", {
      event,
      editMode: true,
    });
  }, [navigation]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true} // Melhora performance ao remover views fora de tela
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshEvents}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Card - Memoizado para evitar re-renders */}
        <WelcomeCard 
          onAddPress={handleAddPress} 
          onSearchPress={handleSearchPress} 
        />

        {/* Next Event Card - Memoizado */}
        <NextEventCard 
          event={nextEvent} 
          onViewDetails={handleViewDetails} 
          onEdit={handleEdit} 
        />

        {/* Upcoming Events - Componente já externo */}
        <Text style={styles.sectionTitle}>Compromissos Próximos</Text>
        <UpcomingEvents onEventPress={handleEventPress} />
      </ScrollView>

      <FAB
        icon={{ name: "add", color: "white" }}
        color={theme.colors.primary}
        placement="right"
        onPress={handleAddPress}
      />
    </View>
  );
};

export default HomeScreen;
