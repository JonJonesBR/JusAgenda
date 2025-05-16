import React, { useState } from 'react'; // Removed useEffect and useCallback as they are not used
import { View, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Text } from 'react-native';
import { Card, FAB } from '@rneui/themed';
import { Calendar, DateData } from 'react-native-calendars';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useEvents, EventCrudProvider, Event } from '../contexts/EventCrudContext'; // Event type from context
import { formatDate } from '../utils/dateUtils'; // Assuming this is the correct export
// Removed useTheme as theme colors are hardcoded or through componentColors for now

const componentColors = {
  white: '#FFFFFF',
  primary: '#6200ee',
  lightGrey: '#eee',
  textGrey: '#757575',
  textDarkGrey: '#555',
  textBlack: '#222',
  borderColor: '#ccc',
  modalOverlay: 'rgba(0,0,0,0.3)',
  deleteRed: '#e53935',
};

const UnifiedCalendarScreen: React.FC = () => {
  // events from useEvents is not directly used, getEventsByDate is used.
  const { addEvent, updateEvent, deleteEvent, getEventsByDate } = useEvents();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date())); // formatDate from dateUtils
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório.');
      return;
    }
    const eventData = {
      title,
      date: selectedDate, // Save with the currently selected date on the calendar
      description,
      // Ensure other required Event fields are included or handled by addEvent/updateEvent defaults
    };

    if (editingEvent && editingEvent.id) {
      updateEvent({ ...editingEvent, ...eventData } as Event); // Cast to Event
    } else {
      // For addEvent, ensure all non-optional fields of Event (excluding id) are present
      // or that addEvent handles their defaults.
      addEvent(eventData as Omit<Event, 'id'>);
    }
    setModalVisible(false);
  };

  const handleDelete = () => {
    if (editingEvent && editingEvent.id) {
      deleteEvent(editingEvent.id);
      setModalVisible(false);
    }
  };

  const renderEvent = ({ item, drag, isActive }: RenderItemParams<Event>) => (
    <TouchableOpacity
      activeOpacity={1} // Keep the touchable opacity active
      onLongPress={drag} // Enable dragging on long press
      disabled={isActive} // Disable touch interactions while dragging
      onPress={() => openEditModal(item)} // Keep existing press functionality
    >
      <Card containerStyle={styles.card}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        {item.description && <Text style={styles.eventDescription}>{item.description}</Text>}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: componentColors.primary },
          // Potentially mark other dates with events here
        }}
        theme={{
            arrowColor: componentColors.primary,
            todayTextColor: componentColors.primary,
            selectedDayBackgroundColor: componentColors.primary,
            selectedDayTextColor: componentColors.white,
            // Add other theme properties if needed
        }}
      />
      <Text style={styles.sectionTitle}>Eventos de {selectedDate}</Text>
      <DraggableFlatList<Event>
        data={getEventsByDate(selectedDate)}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento.</Text>}
        onDragEnd={({ data }) => { /* TODO: Update your state/context with the new order */ console.log('New order:', data); }}
      />
      <FAB
        placement="right"
        color={componentColors.primary}
        icon={{ name: 'add', color: componentColors.white }}
        onPress={openAddModal}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Título do evento"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              {editingEvent && (
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.buttonTextWhite}>Excluir</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.buttonTextWhite}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonTextWhite: {
    color: componentColors.white,
  },
  cancelButton: {
    backgroundColor: componentColors.lightGrey,
    borderRadius: 6,
    marginLeft: 8,
    padding: 10,
  },
  card: {
    borderRadius: 10,
    marginBottom: 8,
  },
  container: {
    backgroundColor: componentColors.white,
    flex: 1,
    padding: 0, // Calendar might have its own padding
  },
  deleteButton: {
    backgroundColor: componentColors.deleteRed,
    borderRadius: 6,
    marginRight: 'auto',
    padding: 10,
  },
  emptyText: {
    color: componentColors.textGrey,
    marginTop: 32,
    textAlign: 'center',
  },
  eventDescription: {
    color: componentColors.textDarkGrey,
    fontSize: 14,
  },
  eventTitle: {
    color: componentColors.textBlack,
    fontSize: 16,
    fontWeight: 'bold', // Added for emphasis
  },
  input: {
    borderColor: componentColors.borderColor,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 16,
    padding: 10,
  },
  modalButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    // gap: 8, // 'gap' might not be supported, using margins
    justifyContent: 'flex-end',
    marginTop: 8, // Added margin top for spacing
  },
  modalContent: {
    alignItems: 'stretch',
    backgroundColor: componentColors.white,
    borderRadius: 10,
    padding: 24,
    width: '85%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: componentColors.modalOverlay,
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center', // Centered title
  },
  saveButton: {
    backgroundColor: componentColors.primary,
    borderRadius: 6,
    marginLeft: 8,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

// Wrapper component to provide the EventCrudContext
const UnifiedCalendarScreenWithProvider: React.FC = () => {
  return (
    <EventCrudProvider>
      <UnifiedCalendarScreen />
    </EventCrudProvider>
  );
};

export default UnifiedCalendarScreenWithProvider;
