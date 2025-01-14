import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Input, Button } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import { requestPermissions, scheduleEventNotification } from '../services/NotificationService';

const AddEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingEvent = route.params?.event;
  const { addEvent, updateEvent } = useEvents();

  const [title, setTitle] = useState(editingEvent?.title || '');
  const [date, setDate] = useState(editingEvent ? new Date(editingEvent.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [type, setType] = useState(editingEvent?.type || 'audiencia');
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [client, setClient] = useState(editingEvent?.client || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [customMessage, setCustomMessage] = useState(`Você tem um compromisso "${title}" amanhã`);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    updateNotificationMessage();
  }, [title, date, type, location]);

  const updateNotificationMessage = () => {
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setCustomMessage(`Compromisso: ${type.charAt(0).toUpperCase() + type.slice(1)} de ${client} no dia ${formattedDate} às ${formattedTime} no Fórum de ${location}`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return;
    }

    const eventData = {
      title: title.trim(),
      date: date.toISOString(),
      type,
      location: location.trim(),
      client: client.trim(),
      description: description.trim(),
    };

    if (date < new Date()) {
      Alert.alert('Erro', 'A data/hora não pode ser no passado.');
      return;
    }

    try {
      let savedEvent;

      if (editingEvent) {
        const success = await updateEvent(editingEvent.id, eventData);
        if (success) {
          savedEvent = { ...eventData, id: editingEvent.id };
        }
      } else {
        savedEvent = await addEvent(eventData);
      }

      if (!savedEvent) {
        throw new Error('Falha ao salvar compromisso');
      }

      // Agenda a notificação
      await scheduleEventNotification(savedEvent, customMessage);

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o compromisso. Por favor, tente novamente.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(new Date(selectedDate)); 
      updateNotificationMessage();
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
      updateNotificationMessage();
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const eventTypes = [
    { id: 'audiencia', label: 'Audiência', icon: 'gavel' },
    { id: 'reuniao', label: 'Reunião', icon: 'groups' },
    { id: 'prazo', label: 'Prazo', icon: 'timer' },
    { id: 'outros', label: 'Outros', icon: 'event' },
  ];

  const handleTitleChange = (text) => {
    setTitle(text);
    updateNotificationMessage();
  };

  const handleClientChange = (text) => {
    setClient(text);
    updateNotificationMessage();
  };

  const handleLocationChange = (text) => {
    setLocation(text);
    updateNotificationMessage();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView>
        <View style={styles.content}>
          <Text h4 style={styles.title}>{editingEvent ? 'Editar Compromisso' : 'Novo Compromisso'}</Text>

          <Input
            label="Título"
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Digite o título do compromisso"
            leftIcon={{ type: 'material', name: 'edit', color: '#757575' }}
            autoFocus
            onFocus={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
          />

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Data</Text>
            <Button
              title={formatDate(date)}
              type="outline"
              icon={{
                name: 'calendar-today',
                size: 20,
                color: '#6200ee',
              }}
              buttonStyle={styles.dateButton}
              titleStyle={styles.dateButtonText}
              onPress={openDatePicker}
            />
          </View>

          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                locale="pt-BR"
              />
              <Button title="OK" onPress={() => setShowDatePicker(false)} style={styles.okButton} />
            </View>
          )}

          <View style={styles.timeContainer}>
            <Text style={styles.label}>Hora</Text>
            <Button
              title={formatTime(date)}
              type="outline"
              icon={{
                name: 'access-time',
                size: 20,
                color: '#6200ee',
              }}
              buttonStyle={styles.dateButton}
              titleStyle={styles.dateButtonText}
              onPress={openTimePicker}
            />
          </View>

          {showTimePicker && (
            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={date}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                locale="pt-BR"
              />
              <Button title="OK" onPress={() => setShowTimePicker(false)} style={styles.okButton} />
            </View>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Tipo</Text>
          <View style={styles.typeContainer}>
            {eventTypes.map((eventType) => (
              <Button
                key={eventType.id}
                title={eventType.label}
                icon={{
                  name: eventType.icon,
                  size: 20,
                  color: type === eventType.id ? 'white' : '#6200ee',
                }}
                type={type === eventType.id ? 'solid' : 'outline'}
                buttonStyle={[
                  styles.typeButton,
                  type === eventType.id && styles.typeButtonActive,
                ]}
                titleStyle={[
                  styles.typeButtonText,
                  type === eventType.id && styles.typeButtonTextActive,
                ]}
                onPress={() => setType(eventType.id)}
              />
            ))}
          </View>

          <Input
            label="Local"
            value={location}
            onChangeText={handleLocationChange}
            placeholder="Digite o local do compromisso"
            leftIcon={{ type: 'material', name: 'location-on', color: '#757575' }}
            onFocus={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
          />

          <Input
            label="Cliente"
            value={client}
            onChangeText={handleClientChange}
            placeholder="Digite o nome do cliente"
            leftIcon={{ type: 'material', name: 'person', color: '#757575' }}
            onFocus={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
          />

          <Input
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Digite uma descrição do compromisso"
            leftIcon={{ type: 'material', name: 'description', color: '#757575' }}
            multiline
            numberOfLines={3}
            onFocus={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
              // Adicionando um delay para permitir que o teclado apareça
              setTimeout(() => {
                // Ajustar a posição da tela se necessário
              }, 100);
            }}
          />

          <Input
            label="Mensagem da Notificação"
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Digite a mensagem da notificação"
            leftIcon={{ type: 'material', name: 'notifications', color: '#757575' }}
            onFocus={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
          />

          <Button
            title="Salvar"
            icon={{
              name: 'save',
              size: 20,
              color: 'white',
            }}
            buttonStyle={styles.saveButton}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    color: '#000000',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#86939e',
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  timeContainer: {
    marginBottom: 16,
  },
  dateButton: {
    borderColor: '#6200ee',
    borderRadius: 10,
    height: 50,
  },
  dateButtonText: {
    color: '#6200ee',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
    borderColor: '#6200ee',
    marginBottom: 8,
  },
  typeButtonActive: {
    backgroundColor: '#6200ee',
  },
  typeButtonText: {
    color: '#6200ee',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    height: 50,
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  okButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    height: 50,
    marginTop: 16,
  },
});

export default AddEventScreen;
