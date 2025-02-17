import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native';
import { Text, Card, Icon, Button, Overlay, Input } from '@rneui/themed';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import { formatDate, formatTime } from '../utils/dateUtils';
import { COLORS } from '../utils/common';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const { events, refreshEvents, deleteEvent } = useEvents();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('start');

  useEffect(() => {
    refreshEvents();
    setFilteredEvents(events);
  }, []);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredEvents(events);
    }
    updateMarkedDates(events);
  }, [events]);

  const updateMarkedDates = (eventsToMark) => {
    const marks = {};
    eventsToMark.forEach((event) => {
      const dateString = new Date(event.date).toISOString().split('T')[0];
      marks[dateString] = {
        marked: true,
        dotColor: getEventColor(event.type),
      };
    });
    setMarkedDates(marks);
  };

  const handleDatePickerChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerType === 'start') {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const showFilterDialog = () => {
    setIsFilterVisible(true);
  };

  const handleExportFiltered = () => {
    navigation.navigate('Export', { preSelectedEvents: filteredEvents });
  };

  const getEventColor = (type) => {
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
  };

  const getEventTypeIcon = (type) => {
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
  };

  const getDayEvents = (dateString) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  const handleEventPress = (event) => {
    Alert.alert(
      'Opções',
      'O que você deseja fazer?',
      [
        {
          text: 'Visualizar',
          onPress: () => navigation.navigate('EventView', { event }),
        },
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EventDetails', { event }),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmDelete(event),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDelete = (event) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este compromisso?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              refreshEvents();
              applyFilter();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o compromisso');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddEvent = () => {
    navigation.navigate('EventDetails');
  };

  const renderEvents = useCallback(() => {
    let eventsToRender = selectedDate 
      ? getDayEvents(selectedDate)
      : filteredEvents;

    if (eventsToRender.length === 0) {
      return (
        <Card containerStyle={styles.emptyCard}>
          <Icon name="event-busy" size={48} color="#757575" />
          <Text style={styles.emptyText}>
            {selectedDate 
              ? 'Nenhum compromisso nesta data'
              : 'Nenhum compromisso encontrado'}
          </Text>
        </Card>
      );
    }

    // Ordena os eventos por data
    eventsToRender.sort((a, b) => new Date(a.date) - new Date(b.date));

    return eventsToRender.map((event) => (
      <TouchableOpacity
        key={event.id}
        onPress={() => handleEventPress(event)}
      >
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
    ));
  }, [selectedDate, filteredEvents, events]);

  const applyFilter = () => {
    let filtered = [...events];
    
    switch (filterType) {
      case 'range':
        filtered = events.filter(event => {
          const eventDate = new Date(event.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          eventDate.setHours(0, 0, 0, 0);
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          return eventDate >= start && eventDate <= end;
        });
        break;
      case 'specific':
        filtered = events.filter(event => {
          const eventDate = new Date(event.date);
          const start = new Date(startDate);
          eventDate.setHours(0, 0, 0, 0);
          start.setHours(0, 0, 0, 0);
          return eventDate.getTime() === start.getTime();
        });
        break;
      case 'all':
      default:
        filtered = events;
    }

    // Ordena os eventos por data
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setFilteredEvents(filtered);
    updateMarkedDates(filtered);
    setSelectedDate(''); // Limpa a data selecionada ao aplicar filtro
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Agenda</Text>
        <View style={styles.headerButtons}>
          <Button
            icon={{ 
              name: 'filter-list', 
              color: filterType !== 'all' ? COLORS.secondary : 'white' 
            }}
            type="clear"
            onPress={showFilterDialog}
          />
          <Button
            icon={{ name: 'file-download', color: 'white' }}
            type="clear"
            onPress={handleExportFiltered}
          />
        </View>
      </View>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
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
          'stylesheet.calendar.header': {
            arrow: {
              padding: 10,
            },
          },
        }}
      />

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

      <ScrollView style={styles.eventsContainer}>
        {renderEvents()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    margin: 0,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  overlay: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  overlayTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    width: '48%',
    marginBottom: 10,
  },
  dateInputs: {
    marginBottom: 20,
  },
  dateInput: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  dateInputLabel: {
    color: COLORS.text.secondary,
    marginBottom: 5,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  eventsContainer: { flex: 1, padding: 16 },
  emptyCard: { borderRadius: 10, padding: 24, alignItems: 'center', elevation: 4 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#757575' },
  eventCard: { borderRadius: 10, padding: 16, marginBottom: 8, elevation: 4 },
  eventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eventType: { flex: 1, marginLeft: 8, fontSize: 14, color: '#757575' },
  eventTime: { fontSize: 14, color: '#000' },
  eventTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#000' },
  eventInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  eventText: { marginLeft: 8, fontSize: 14, color: '#000' },
});

export default CalendarScreen;
