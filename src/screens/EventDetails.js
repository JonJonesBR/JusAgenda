// EventDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEvents } from '../contexts/EventContext';
import { formatDateTime } from '../utils/dateUtils';

const EventDetails = ({ route, navigation }) => {
  const { addEvent, updateEvent, events } = useEvents();
  const editingEvent = route.params?.event;
  const isEditing = !!editingEvent;

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: new Date(),
    location: '',
    description: '',
    client: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inicializa os dados do formulário, se estiver editando
  useEffect(() => {
    if (editingEvent) {
      const parsedDate = editingEvent.date ? new Date(editingEvent.date) : new Date();
      setFormData({ ...editingEvent, date: parsedDate });
    }
  }, [editingEvent]);

  // Listener para atualizar o formulário quando a tela ganhar foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (editingEvent) {
        const updatedEvent = events.find(e => e.id === editingEvent.id);
        if (updatedEvent) {
          const parsedDate = updatedEvent.date ? new Date(updatedEvent.date) : new Date();
          setFormData({ ...updatedEvent, date: parsedDate });
        }
      }
    });
    return unsubscribe;
  }, [navigation, editingEvent, events]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('date', selectedDate);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return false;
    }
    if (!formData.type.trim()) {
      Alert.alert('Erro', 'O tipo é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Converte o objeto Date para string (ISO) se for válido, ou usa a data atual
      const validDate =
        formData.date instanceof Date && !isNaN(formData.date.getTime())
          ? formData.date.toISOString()
          : new Date().toISOString();

      const eventData = { ...formData, date: validDate };

      if (isEditing) {
        await updateEvent({ ...eventData, id: editingEvent.id });
        Alert.alert('Sucesso', 'Compromisso atualizado com sucesso');
      } else {
        await addEvent(eventData);
        Alert.alert('Sucesso', 'Compromisso criado com sucesso');
      }
      // Se o parâmetro 'from' for 'EventView', retorna para a HomeScreen; caso contrário, volta à tela anterior
      if (route.params?.from === 'EventView') {
        navigation.navigate('HomeScreen');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao salvar compromisso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text h4 style={styles.title}>
          {isEditing ? 'Editar Compromisso' : 'Novo Compromisso'}
        </Text>

        <Input
          label="Título"
          value={formData.title}
          onChangeText={(value) => handleChange('title', value)}
          placeholder="Digite o título"
        />

        <Input
          label="Tipo"
          value={formData.type}
          onChangeText={(value) => handleChange('type', value)}
          placeholder="audiencia, reuniao, prazo, etc"
        />

        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Data e Hora</Text>
          <Button
            title={formatDateTime(formData.date)}
            onPress={() => setShowDatePicker(true)}
            type="outline"
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Input
          label="Local"
          value={formData.location}
          onChangeText={(value) => handleChange('location', value)}
          placeholder="Digite o local (opcional)"
        />

        <Input
          label="Cliente"
          value={formData.client}
          onChangeText={(value) => handleChange('client', value)}
          placeholder="Digite o nome do cliente (opcional)"
        />

        <Input
          label="Descrição"
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
          placeholder="Digite a descrição (opcional)"
          multiline
          numberOfLines={4}
        />

        <Button
          title={isEditing ? 'Atualizar' : 'Criar'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16 },
  title: { textAlign: 'center', marginBottom: 24 },
  dateContainer: { marginBottom: 16 },
  dateLabel: { fontSize: 16, color: '#86939e', fontWeight: 'bold', marginBottom: 8 },
  buttonContainer: { marginTop: 16, marginBottom: 32 },
});

export default EventDetails;
