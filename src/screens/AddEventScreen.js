import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
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
  const [type, setType] = useState(editingEvent?.type || 'audiencia');
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [client, setClient] = useState(editingEvent?.client || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [customMessage, setCustomMessage] = useState(`Você tem um evento "${title}" amanhã`);

  useEffect(() => {
    requestPermissions();
  }, []);

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
        throw new Error('Falha ao salvar evento');
      }

      // Agenda a notificação
      await scheduleEventNotification(savedEvent, customMessage);

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o evento. Por favor, tente novamente.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text h4 style={styles.title}>
          {editingEvent ? 'Editar Evento' : 'Novo Evento'}
        </Text>

        <Input
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Digite o título do evento"
          leftIcon={{ type: 'material', name: 'edit', color: '#757575' }}
          autoFocus
        />

        <View style={styles.dateContainer}>
          <Text style={styles.label}>Data e Hora</Text>
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
            onPress={() => setShowDatePicker(true)}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
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
          onChangeText={setLocation}
          placeholder="Digite o local do evento"
          leftIcon={{ type: 'material', name: 'location-on', color: '#757575' }}
        />

        <Input
          label="Cliente"
          value={client}
          onChangeText={setClient}
          placeholder="Digite o nome do cliente"
          leftIcon={{ type: 'material', name: 'person', color: '#757575' }}
        />

        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Digite uma descrição do evento"
          leftIcon={{ type: 'material', name: 'description', color: '#757575' }}
          multiline
          numberOfLines={3}
        />

        <Input
          label="Mensagem da Notificação"
          value={customMessage}
          onChangeText={setCustomMessage}
          placeholder="Digite a mensagem da notificação"
          leftIcon={{ type: 'material', name: 'notifications', color: '#757575' }}
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
});

export default AddEventScreen;
