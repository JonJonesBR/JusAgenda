import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import uuid from 'react-native-uuid';

// Cores e Estilo Profissional para JusAgenda
const COLORS = {
  PRIMARY: '#1A5F7A',   // Azul profissional da justiça
  SECONDARY: '#134B6A', // Azul escuro para contraste
  BACKGROUND: '#F4F7F9',
  TEXT: '#333333',
  WHITE: '#FFFFFF',
  ACCENT: '#2C8CB4'
};

// Modelo de Evento para JusAgenda
const EventModel = {
  id: '',
  title: '',
  type: '', // 'prazo', 'audiencia', 'reuniao'
  date: '',
  time: '',
  description: '',
  client: '',
  alerts: [], // ['email', 'push']
  status: 'pendente'
};

const JusAgendaApp = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({...EventModel});

  // Salvar evento com validações
  const saveEvent = async () => {
    // Validações de campos obrigatórios
    if (!currentEvent.title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o evento');
      return;
    }

    try {
      const newEvent = {
        ...currentEvent,
        id: uuid.v4(), // Geração de ID único
        date: selectedDate
      };
      
      const updatedEvents = [...events, newEvent];
      await AsyncStorage.setItem('jus_agenda_events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      setModalVisible(false);
      
      // Resetar formulário
      setCurrentEvent({...EventModel});
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o evento');
      console.error('Erro ao salvar evento', error);
    }
  };

  // Carregar eventos
  const loadEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('jus_agenda_events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os eventos');
      console.error('Erro ao carregar eventos', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Renderização de Eventos Marcados
  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = { 
      marked: true, 
      dotColor: COLORS.PRIMARY 
    };
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.header}>JusAgenda</Text>
      
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setModalVisible(true);
        }}
        theme={{
          selectedDayBackgroundColor: COLORS.PRIMARY,
          todayTextColor: COLORS.SECONDARY,
        }}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalTitle}>Novo Evento em {selectedDate}</Text>
            
            <Text style={styles.label}>Tipo de Evento</Text>
            <View style={styles.pickerContainer}>
              {['Prazo', 'Audiência', 'Reunião'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[
                    styles.pickerButton, 
                    currentEvent.type === type.toLowerCase() && styles.pickerButtonSelected
                  ]}
                  onPress={() => setCurrentEvent({...currentEvent, type: type.toLowerCase()})}
                >
                  <Text style={styles.pickerButtonText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Título do Evento"
              value={currentEvent.title}
              onChangeText={(text) => setCurrentEvent({...currentEvent, title: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Nome do Cliente (opcional)"
              value={currentEvent.client}
              onChangeText={(text) => setCurrentEvent({...currentEvent, client: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição do Evento"
              multiline
              numberOfLines={3}
              value={currentEvent.description}
              onChangeText={(text) => setCurrentEvent({...currentEvent, description: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Hora do Evento (HH:MM)"
              value={currentEvent.time}
              onChangeText={(text) => setCurrentEvent({...currentEvent, time: text})}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={saveEvent}
              >
                <Text style={styles.buttonText}>Salvar Evento</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 50
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '90%'
  },
  modalTitle: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    marginBottom: 15,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    color: COLORS.TEXT,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  pickerButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 5
  },
  pickerButtonSelected: {
    backgroundColor: COLORS.PRIMARY
  },
  pickerButtonText: {
    textAlign: 'center',
    color: COLORS.PRIMARY
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5
  },
  cancelButton: {
    backgroundColor: COLORS.SECONDARY,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5
  },
  buttonText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default JusAgendaApp;