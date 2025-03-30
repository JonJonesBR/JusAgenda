import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  RefreshControl,
  FlatList,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, Card, Icon, Button, Overlay } from '@rneui/themed';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import SkeletonLoader from '../components/SkeletonLoader';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEvents } from '../contexts/EventContext';
import { formatDate, formatTime } from '../utils/dateUtils';
import { COLORS } from '../utils/common';

// Configuração do calendário em português
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.',
    'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-br';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const { events, refreshEvents, deleteEvent, loading } = useEvents();
  const [refreshing, setRefreshing] = useState(false);
  const [deletedEvent, setDeletedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('start');
  const [isEventsModalVisible, setIsEventsModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        await refreshEvents();
        if (isMounted) {
          setFilteredEvents(events);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    loadEvents();
    return () => { isMounted = false; };
  }, [refreshEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEvents();
    setFilteredEvents(events);
    setRefreshing(false);
  }, [refreshEvents, events]);

  const getEventColor = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case 'audiencia':
        return '#6200ee';
      case 'reuniao':
        return '#03dac6';
      case 'prazo':
        return '#ff0266';
      default:
        return '#018786';
    }
  }, []);

  const updateMarkedDates = useCallback((eventsToMark) => {
    const marks = {};
    eventsToMark.forEach((event) => {
      try {
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) {
          console.warn(`Invalid date found in event: ${event.id}`);
          return;
        }
        const dateString = eventDate.toISOString().split('T')[0];
        marks[dateString] = {
          marked: true,
          dotColor: getEventColor(event.type),
        };
      } catch (error) {
        console.warn(`Error processing date for event ${event.id || 'unknown'}:`, error);
      }
    });
    setMarkedDates(marks);
  }, [getEventColor]);

  useEffect(() => {
    try {
      if (filterType === 'all') {
        setFilteredEvents(events);
      }
      if (events && Array.isArray(events)) {
        updateMarkedDates(events);
      }
    } catch (error) {
      console.error('Error updating filtered events or marked dates:', error);
    }
  }, [events, filterType, updateMarkedDates]);

  const handleDatePickerChange = useCallback((e, selected) => {
    setShowDatePicker(false);
    if (selected) {
      if (datePickerType === 'start') {
        setStartDate(selected);
      } else {
        setEndDate(selected);
      }
    }
  }, [datePickerType]);

  const getEventTypeIcon = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case 'audiencia':
        return { name: 'gavel', color: '#6200ee' };
      case 'reuniao':
        return { name: 'groups', color: '#03dac6' };
      case 'prazo':
        return { name: 'timer', color: '#ff0266' };
      default:
        return { name: 'event', color: '#018786' };
    }
  }, []);

  const getDayEvents = useCallback((dateString) => {
    return filteredEvents.filter((event) => {
      try {
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) {
          console.warn(`Invalid date found in event: ${event.id}`);
          return false;
        }
        return eventDate.toISOString().split('T')[0] === dateString;
      } catch (error) {
        console.warn(`Error processing date for event ${event.id || 'unknown'}:`, error);
        return false;
      }
    });
  }, [filteredEvents]);

  const applyFilter = useCallback(() => {
    try {
      switch (filterType) {
        case 'all':
          setFilteredEvents(events);
          break;
        case 'specific':
          setFilteredEvents(events.filter(event => {
            try {
              const eventDate = new Date(event.date);
              if (isNaN(eventDate.getTime())) {
                console.warn(`Invalid date found in event: ${event.id}`);
                return false;
              }
              const filterDate = startDate.toISOString().split('T')[0];
              return eventDate.toISOString().split('T')[0] === filterDate;
            } catch (error) {
              console.warn(`Error processing date for event ${event.id || 'unknown'}:`, error);
              return false;
            }
          }));
          break;
        case 'range':
          setFilteredEvents(events.filter(event => {
            try {
              const eventDate = new Date(event.date);
              if (isNaN(eventDate.getTime())) {
                console.warn(`Invalid date found in event: ${event.id}`);
                return false;
              }
              return eventDate >= startDate && eventDate <= endDate;
            } catch (error) {
              console.warn(`Error processing date for event ${event.id || 'unknown'}:`, error);
              return false;
            }
          }));
          break;
        default:
          setFilteredEvents(events);
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      setFilteredEvents(events);
    }
  }, [events, filterType, startDate, endDate]);

  const undoDelete = useCallback(async () => {
    if (deletedEvent) {
      try {
        await refreshEvents();
        setDeletedEvent(null);
        Toast.show({
          type: 'success',
          text1: 'Exclusão desfeita',
          text2: 'O compromisso foi restaurado com sucesso',
          position: 'bottom',
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível restaurar o compromisso',
          position: 'bottom',
        });
      }
    }
  }, [deletedEvent, refreshEvents]);

  const confirmDelete = useCallback((event) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este compromisso?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setDeletedEvent(event);
              await deleteEvent(event.id);
              await refreshEvents();
              applyFilter();
              Toast.show({
                type: 'info',
                text1: 'Compromisso excluído',
                text2: 'Toque para desfazer',
                position: 'bottom',
                visibilityTime: 4000,
                autoHide: true,
                onPress: undoDelete,
              });
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível excluir o compromisso. Tente novamente.',
                position: 'bottom',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [deleteEvent, refreshEvents, undoDelete, applyFilter]);

  const handleEventPress = useCallback((event) => {
    Haptics.selectionAsync();
    Alert.alert(
      'Opções',
      'O que você deseja fazer?',
      [
        { text: 'Visualizar', onPress: () => navigation.navigate('EventView', { event }) },
        { text: 'Editar', onPress: () => navigation.navigate('EventDetails', { event }) },
        { text: 'Excluir', style: 'destructive', onPress: () => confirmDelete(event) },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [navigation, confirmDelete]);

  const handleExportFiltered = useCallback(() => {
    // Navigate to the Sync tab, then to the SyncExportOptions screen within that tab's stack
    navigation.navigate('Sync', { screen: 'SyncExportOptions' }); 
  }, [navigation]);

  const onDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
    setIsEventsModalVisible(true);
  }, []);

  const renderModalEvents = () => {
    const dayEvents = getDayEvents(selectedDate);
    if (dayEvents.length === 0) {
      return (
        <Card containerStyle={styles.emptyCard}>
          <Icon name="event-busy" size={48} color="#757575" />
          <Text style={styles.emptyText}>Nenhum compromisso nesta data</Text>
        </Card>
      );
    }
    dayEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    return (
      <FlatList
        data={dayEvents}
        keyExtractor={item => item.id}
        renderItem={({ item: event }) => (
          <TouchableOpacity onPress={() => { setIsEventsModalVisible(false); handleEventPress(event); }} activeOpacity={0.85}>
            <Card containerStyle={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Icon {...getEventTypeIcon(event.type)} />
                <Text style={styles.eventType}>
                  {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                </Text>
                <Text style={styles.eventTime}>{formatTime(event.date)}</Text>
              </View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {event.location && (
                <View style={styles.eventInfo}>
                  <Icon name="location-on" size={16} color="#757575" />
                  <Text style={styles.eventText}>{event.location}</Text>
                </View>
              )}
              {event.client && (
                <View style={styles.eventInfo}>
                  <Icon name="person" size={16} color="#757575" />
                  <Text style={styles.eventText}>{event.client}</Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.header}>
          <Text h4 style={styles.headerTitle}>Agenda</Text>
          <View style={styles.headerButtons}>
            <Button icon={{ name: 'filter-list', color: 'white' }} type="clear" disabled />
            <Button icon={{ name: 'file-download', color: 'white' }} type="clear" disabled />
          </View>
        </View>
        <View style={styles.skeletonCalendar}>
          <SkeletonLoader type="list" height={300} />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Agenda</Text>
        <View style={styles.headerButtons}>
          <Button
            icon={{ name: 'filter-list', color: filterType !== 'all' ? COLORS.secondary : 'white' }}
            type="clear"
            onPress={() => setIsFilterVisible(true)}
          />
          <Button
            icon={{ name: 'file-download', color: 'white' }}
            type="clear"
            onPress={handleExportFiltered}
          />
        </View>
      </View>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: COLORS.primary,
          },
        }}
        theme={{
          todayTextColor: COLORS.primary,
          selectedDayBackgroundColor: COLORS.primary,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.primary,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
          'stylesheet.calendar.header': { arrow: { padding: 10 } },
        }}
      />
      <Overlay
        isVisible={isEventsModalVisible}
        onBackdropPress={() => setIsEventsModalVisible(false)}
        overlayStyle={styles.eventsModal}
      >
        <View style={styles.eventsModalHeader}>
          <Text style={styles.eventsModalTitle}>Compromissos para {selectedDate}</Text>
          <Button title="Fechar" onPress={() => setIsEventsModalVisible(false)} type="clear" />
        </View>
        {renderModalEvents()}
      </Overlay>
      <Overlay
        isVisible={isFilterVisible}
        onBackdropPress={() => setIsFilterVisible(false)}
        overlayStyle={styles.overlay}
      >
        <Text h4 style={styles.overlayTitle}>Filtrar Eventos</Text>
        <View style={styles.filterOptions}>
          <Button
            title="Todos"
            type={filterType === 'all' ? 'solid' : 'outline'}
            onPress={() => setFilterType('all')}
            containerStyle={styles.filterButton}
          />
          <Button
            title="Intervalo"
            type={filterType === 'range' ? 'solid' : 'outline'}
            onPress={() => setFilterType('range')}
            containerStyle={styles.filterButton}
          />
          <Button
            title="Data Específica"
            type={filterType === 'specific' ? 'solid' : 'outline'}
            onPress={() => setFilterType('specific')}
            containerStyle={styles.filterButton}
          />
        </View>
        {(filterType === 'range' || filterType === 'specific') && (
          <View style={styles.dateInputs}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setDatePickerType('start');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateInputLabel}>Data Inicial</Text>
              <Text>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            {filterType === 'range' && (
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setDatePickerType('end');
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateInputLabel}>Data Final</Text>
                <Text>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={datePickerType === 'start' ? startDate : endDate}
            mode="date"
            display="default"
            onChange={handleDatePickerChange}
          />
        )}
        <Button
          title="Aplicar Filtro"
          onPress={() => {
            applyFilter();
            setIsFilterVisible(false);
          }}
          buttonStyle={styles.applyButton}
        />
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row' },
  overlay: { width: '90%', borderRadius: 10, padding: 20 },
  overlayTitle: { textAlign: 'center', marginBottom: 20 },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: { width: '48%', marginBottom: 10 },
  dateInputs: { marginBottom: 20 },
  dateInput: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  dateInputLabel: { color: COLORS.textSecondary, marginBottom: 5 },
  applyButton: { backgroundColor: COLORS.primary, borderRadius: 8 },
  eventsModal: { width: '90%', maxHeight: '80%', borderRadius: 12, padding: 16 },
  eventsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventsModalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  skeletonCalendar: { padding: 16, backgroundColor: '#f5f5f5' },
  emptyCard: { borderRadius: 12, padding: 24, alignItems: 'center', elevation: 4 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#757575' },
  eventCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  eventType: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  eventTime: { fontSize: 16, color: '#333' },
  eventTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333', textAlign: 'center' },
  eventInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  eventText: { marginLeft: 8, fontSize: 16, color: '#333' },
});

export default memo(CalendarScreen);
