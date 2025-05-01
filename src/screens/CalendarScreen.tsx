import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { FAB, Icon } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Agenda, LocaleConfig } from "react-native-calendars";
import { useEvents } from "../contexts/EventContext";
import { useTheme } from "../contexts/ThemeContext";
import { calendarTheme } from "../theme/calendarTheme";
import moment from "moment";
import "moment/locale/pt-br";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

// Componentes de performance
import { LazyComponent } from "../components/LazyComponent";
import { OptimizedFlatList } from "../components/OptimizedFlatList";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { useResponsiveDimensions, responsiveSize } from "../utils/responsiveUtils";
import { prefetchManager, PrefetchResourceType } from "../utils/prefetchManager";
import { formatDate, formatTime } from "../utils/dateUtils";
import type { Event } from "../types/event";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

moment.locale("pt-br");

// Configuração do calendário em português
LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

type NavigationProp = NativeStackNavigationProp<{
  EventDetails: { event?: Event; editMode?: boolean };
}>;

const CalendarScreen = () => {
  // Hooks para navegação e estado
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { theme } = useTheme();
  const { events, deleteEvent } = useEvents();
  
  // Estados para o gerenciamento do calendário
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [eventsMap, setEventsMap] = useState<{[key: string]: Event[]}>({});
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  // Estados para gerenciamento de modais
  // Removendo estados não utilizados para limpar o código
  const [isEventsModalVisible, setIsEventsModalVisible] = useState(false);
  const [menuEvent, setMenuEvent] = useState<Event | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showUndoDelete, setShowUndoDelete] = useState(false);
  const [lastDeletedEvent, setLastDeletedEvent] = useState<Event | null>(null);

  // Obter cor do evento com base no tipo (memoizada para evitar recálculos desnecessários)
  const getEventColor = useCallback((type: string) => {
    switch (type?.toLowerCase()) {
      case "audiencia":
        return theme.colors.warning;
      case "prazo":
        return theme.colors.error;
      case "reuniao":
        return theme.colors.success;
      case "outro":
        return theme.colors.primary;
      default:
        return theme.colors.grey1;
    }
  }, [theme.colors]);

  // Preparar dados do calendário com otimização e memoização
  const prepareCalendarData = useCallback(() => {
    // Definir estado de carregamento
    setRefreshing(true);
    setIsCalendarLoading(true);
    
    // Usar setTimeout para evitar bloqueio da UI durante o processamento
    setTimeout(() => {
      try {
        // Criar mapa de eventos agrupados por data de forma mais eficiente
        const eventsByDate: {[key: string]: Event[]} = {};
        const datesWithEvents: {[key: string]: any} = {};
        
        // Processar eventos em lotes para evitar bloqueio da UI em grandes conjuntos de dados
        const processEvents = () => {
          // Usar reduce para melhor performance em vez de forEach
          events.reduce((acc, event) => {
            const dateStr = moment(event.data).format("YYYY-MM-DD");
            
            // Inicializar array se necessário e adicionar evento
            if (!acc.eventsByDate[dateStr]) {
              acc.eventsByDate[dateStr] = [];
            }
            acc.eventsByDate[dateStr].push(event);
            
            // Marcar data no calendário com cor baseada na prioridade
            acc.datesWithEvents[dateStr] = {
              marked: true,
              dotColor: getEventColor(event.tipo),
            };
            
            return acc;
          }, { eventsByDate, datesWithEvents });
          
          // Atualizar estados com os dados processados
          setEventsMap(eventsByDate);
          setMarkedDates(datesWithEvents);
          setFilteredEvents(eventsByDate[selectedDate] || []);
          setRefreshing(false);
          setIsCalendarLoading(false);
        };
        
        // Executar processamento
        processEvents();
      } catch (error) {
        console.error('Erro ao processar dados do calendário:', error);
        setRefreshing(false);
        setIsCalendarLoading(false);
        Toast.show({
          type: "error",
          text1: "Erro ao carregar calendário",
          text2: "Tente novamente em instantes",
          position: "bottom",
        });
      }
    }, 100); // Pequeno atraso para permitir que a UI responda
  }, [events, selectedDate, getEventColor]);

  // Atualizar dados quando a tela recebe foco
  useEffect(() => {
    if (isFocused) {
      prepareCalendarData();
      
      // Prefetch de eventos para os próximos meses em background
      prefetchManager.forcePrefetch(PrefetchResourceType.EVENTS, { months: 3 })
        .catch(err => {
          console.warn('Erro ao prefetch de eventos:', err);
        });
    }
  }, [isFocused, events, prepareCalendarData]);

  // Função para tratar pressionar uma data no calendário
  const onDayPress = useCallback((day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setFilteredEvents(eventsMap[day.dateString] || []);
    setIsEventsModalVisible(true);
  }, [eventsMap]);

  // Atualizar dados com feedback visual e tátil - usado no componente Agenda
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    prepareCalendarData();
    // Fornecer feedback tátil em dispositivos compatíveis
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [prepareCalendarData]);
  
  // Renderizar item vazio no calendário
  const renderEmptyDate = useCallback(() => {
    return (
      <View style={[styles.emptyCard, { backgroundColor: theme.colors.background }]}>
        <Icon name="event-busy" type="material" size={40} color={theme.colors.grey3} />
        <Text style={[styles.emptyText, { color: theme.colors.grey1 }]}>Nenhum evento nesta data</Text>
      </View>
    );
  }, [theme.colors]);


  
  // Função para tratar o toque em um evento
  const handleEventPress = useCallback((event: Event) => {
    // Fornecer feedback tátil ao pressionar
    Haptics.selectionAsync().catch(() => {});
    
    // Definir o evento selecionado e mostrar o menu
    setMenuEvent(event);
    setIsMenuVisible(true);
  }, []);
  
  // Renderizar item da agenda
  const renderAgendaItem = useCallback((item: Event) => {
    return (
      <TouchableOpacity 
        onPress={() => handleEventPress(item)}
        style={[styles.eventCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.eventHeader}>
          <Text style={[styles.eventType, { color: getEventColor(item.tipo) }]}>{item.tipo}</Text>
          <Text style={[styles.eventTime, { color: theme.colors.text }]}>{formatTime(item.data)}</Text>
        </View>
        <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
        <View style={styles.eventInfo}>
          <Icon name="person" type="material" size={16} color={theme.colors.grey3} />
          <Text style={[styles.eventText, { color: theme.colors.grey1 }]}>{item.cliente}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [theme.colors, getEventColor, handleEventPress]);



  // Confirmar exclusão de evento
  const confirmDelete = useCallback((event: Event) => {
    setIsMenuVisible(false);
    
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o evento "${event.titulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            handleDeleteEvent(event);
          },
        },
      ]
    );
  }, []);

  // Tratar exclusão de evento
  const handleDeleteEvent = useCallback((event: Event) => {
    try {
      deleteEvent(event.id);
      setLastDeletedEvent(event);
      setShowUndoDelete(true);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Toast.show({
        type: "success",
        text1: "Evento excluído",
        text2: showUndoDelete ? "Toque para desfazer" : "Evento removido com sucesso",
        position: "bottom",
        onPress: () => {
          // Implementar lógica para desfazer exclusão se necessário
          if (lastDeletedEvent && showUndoDelete) {
            // Aqui seria implementada a lógica para restaurar o evento
            console.log('Tentando restaurar evento:', lastDeletedEvent.id);
          }
        }
      });
      
      // Atualizar dados do calendário
      prepareCalendarData();
      
      // Ocultar o toast após 3 segundos
      setTimeout(() => {
        setShowUndoDelete(false);
        setLastDeletedEvent(null); // Limpar referência ao evento excluído
      }, 3000);
      
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: error instanceof Error ? error.message : "Erro ao excluir evento",
        position: "bottom",
      });
    }
  }, [deleteEvent, prepareCalendarData, lastDeletedEvent]);
  
  // Renderizar item da lista otimizada para modo landscape tablet
  const renderEventItem = useCallback(({ item, onEventPress }: { item: Event; onEventPress: (event: Event) => void }) => {
    // Usar informações de dimensões responsivas para adaptar o layout
    const { dimensions } = useResponsiveDimensions();
    const { isTablet } = dimensions;
    
    // Ajustar tamanhos com base no dispositivo
    const titleSize = responsiveSize(isTablet ? 18 : 16, 0.4);
    const detailSize = responsiveSize(isTablet ? 14 : 12, 0.4);
    
    return (
      <TouchableOpacity
        onPress={() => onEventPress(item)}
        style={[styles.eventItem, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.eventTypeContainer}>
          <View 
            style={[styles.eventTypeIndicator, { backgroundColor: getEventColor(item.tipo) }]} 
          />
          <Text style={[
            styles.eventTypeText, 
            { color: theme.colors.grey1, fontSize: detailSize }
          ]}>
            {item.tipo} • {formatTime(item.data)}
          </Text>
        </View>
        
        <Text style={[
          styles.eventTitle, 
          { color: theme.colors.text, fontSize: titleSize }
        ]}>
          {item.titulo}
        </Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Icon name="person" type="material" size={14} color={theme.colors.grey3} />
            <Text style={[
              styles.eventDetailText, 
              { color: theme.colors.grey2, fontSize: detailSize }
            ]}>
              {item.cliente}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [theme.colors, getEventColor]);
  
  // Renderizar menu de ações para um evento
  const renderMenuActions = useCallback(() => {
    if (!menuEvent) return null;
    
    return (
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={[
            styles.menuContainer, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
          ]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                navigation.navigate("EventDetails", { event: menuEvent });
              }}
            >
              <Icon name="visibility" type="material" color={theme.colors.primary} size={24} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>Ver detalhes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                navigation.navigate("EventDetails", { event: menuEvent, editMode: true });
              }}
            >
              <Icon name="edit" type="material" color={theme.colors.primary} size={24} />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>Editar evento</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => confirmDelete(menuEvent)}
            >
              <Icon name="delete" type="material" color={theme.colors.error} size={24} />
              <Text style={[styles.menuText, { color: theme.colors.error }]}>Excluir evento</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }, [menuEvent, isMenuVisible, theme.colors, navigation, confirmDelete]);
  
  // Renderizar modal de eventos para uma data
  const renderModalEvents = useCallback(() => {
    return (
      <Modal
        visible={isEventsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEventsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.eventsModal, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
          ]}>
            <View style={styles.eventsModalHeader}>
              <Text style={[
                styles.eventsModalTitle, 
                { color: theme.colors.primary }
              ]}>
                Eventos em {formatDate(selectedDate)}
              </Text>
              
              <TouchableOpacity onPress={() => setIsEventsModalVisible(false)}>
                <Icon name="close" type="material" size={24} color={theme.colors.grey1} />
              </TouchableOpacity>
            </View>
            
            <OptimizedFlatList
              data={filteredEvents}
              renderItem={({ item }) => renderEventItem({ item, onEventPress: handleEventPress })}
              keyExtractor={(item) => item.id}
              estimatedItemSize={100}
              emptyText="Nenhum evento nesta data"
              contentContainerStyle={styles.eventList}
              initialNumToRender={8}
              maxToRenderPerBatch={5}
            />
          </View>
        </View>
      </Modal>
    );
  }, [isEventsModalVisible, selectedDate, filteredEvents, theme.colors, renderEventItem, handleEventPress]);

  // Estado para controlar o carregamento do calendário
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);

  // Componente de calendário carregado de forma lazy para melhorar tempo de inicialização
  const CalendarComponent = useCallback(() => {
    // Efeito para atualizar o estado de carregamento quando o componente for montado
    useEffect(() => {
      setIsCalendarLoading(false);
    }, []);
    
    // Função para renderizar o calendário após o carregamento
    const renderCalendar = () => {
      return (
        <Agenda
          items={eventsMap}
          selected={selectedDate}
          renderItem={renderAgendaItem}
          renderEmptyData={renderEmptyDate}
          onDayPress={onDayPress}
          refreshControl={null}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showClosingKnob={true}
          theme={{
            ...calendarTheme,
            agendaDayTextColor: theme.colors.text,
            agendaDayNumColor: theme.colors.text,
            agendaTodayColor: theme.colors.primary,
            agendaKnobColor: theme.colors.primary,
            todayBackgroundColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            dotColor: theme.colors.primary,
          }}
          futureScrollRange={6}
          pastScrollRange={6}
          markingType="dot"
          markedDates={markedDates}
          // Otimizações para evitar travamentos
          onCalendarToggled={() => {}}
          hideKnob={false}
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={7}
          removeClippedSubviews={true}
        />
      );
    };

    return (
      <LazyComponent
        importFunc={() => Promise.resolve({ default: renderCalendar })}
        loadingText="Carregando calendário..."
        preload={true}
        fallback={<LoadingSkeleton type="calendar" style={styles.calendarSkeleton} />}
        onLoad={() => setIsCalendarLoading(false)}
      />
    );
  }, [eventsMap, selectedDate, renderAgendaItem, renderEmptyDate, onDayPress, markedDates, theme.colors, calendarTheme, refreshing]);


  // Detectar dimensões do dispositivo para layout responsivo
  const { dimensions } = useResponsiveDimensions();
  const { isTablet, orientation } = dimensions;
  
  // Renderização condicional com base no estado de carregamento
  const renderContent = () => {
    // Se estiver carregando e não tiver dados, mostrar esqueleto
    if (isCalendarLoading && Object.keys(eventsMap).length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSkeleton type="calendar" style={styles.calendarSkeleton} />
        </View>
      );
    }

    // Renderização normal para dispositivos móveis
    if (!isTablet || orientation !== 'landscape') {
      return <CalendarComponent />;
    }

    // Layout dividido para tablets em modo paisagem
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <CalendarComponent />
        </View>
        <View style={{ width: 350, borderLeftWidth: 1, borderLeftColor: theme.colors.border }}>
          <View style={styles.listHeaderContainer}>
            <Text style={[styles.listHeaderText, {color: theme.colors.text}]}>
              Eventos em {formatDate(selectedDate)}
            </Text>
          </View>
          
          <OptimizedFlatList
            data={filteredEvents}
            renderItem={({item}) => renderEventItem({item, onEventPress: handleEventPress})}
            keyExtractor={(item) => item.id}
            estimatedItemSize={100}
            emptyText="Nenhum evento nesta data"
            contentContainerStyle={styles.eventList}
            initialNumToRender={8}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderContent()}

      <FAB
        icon={{ name: "add", color: "white" }}
        color={theme.colors.primary}
        style={styles.fab}
        onPress={() => navigation.navigate("EventDetails", { editMode: true })}
      />

      {renderModalEvents()}
      {renderMenuActions()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  calendarSkeleton: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  emptyText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: "#757575" 
  },
  eventCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 16,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  eventType: { 
    fontSize: 16, 
    fontWeight: "bold"
  },
  eventTime: { 
    fontSize: 16
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  eventInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 4 
  },
  eventText: { 
    marginLeft: 8, 
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: 250,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 16,
  },
  eventsModal: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  eventsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eventsModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Estilos responsivos
  eventItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Estilos para o layout splitview (tablet)
  listHeaderContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventList: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  // Estilos para o componente de evento
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeIndicator: {
    width: 4,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  eventDetails: {
    marginTop: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDetailText: {
    marginLeft: 6,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default memo(CalendarScreen);
