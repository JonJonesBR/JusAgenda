import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEvents } from '../contexts/EventContext';
import { formatDateTime } from '../utils/dateUtils';

const EventDetails = ({ route, navigation }) => {
  const { addEvent, updateEvent } = useEvents();
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

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        ...editingEvent,
        date: new Date(editingEvent.date)
      });
    }
  }, [editingEvent]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      if (isEditing) {
        await updateEvent({
          ...formData,
          id: editingEvent.id
        });
        Alert.alert('Sucesso', 'Compromisso atualizado com sucesso');
      } else {
        await addEvent(formData);
        Alert.alert('Sucesso', 'Compromisso criado com sucesso');
      }
      navigation.goBack();
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
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  form: {
    padding: 16
  },
  title: {
    textAlign: 'center',
    marginBottom: 24
  },
  dateContainer: {
    marginBottom: 16
  },
  dateLabel: {
    fontSize: 16,
    color: '#86939e',
    fontWeight: 'bold',
    marginBottom: 8
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32
  }
});

export default EventDetails;