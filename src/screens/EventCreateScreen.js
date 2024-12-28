import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { saveEvent } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';
import { darkTheme } from '../constants/colors';
import { eventFields } from '../constants/eventFields';
import uuid from 'react-native-uuid';

const EventCreateScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const currentTheme = darkTheme;

  const [eventType, setEventType] = useState(route.params?.eventType || 'outros');
  const [eventData, setEventData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (date) => {
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const isValidDate = (date) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) return false;

    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const formatInputDate = (value) => {
    // Remove caracteres não numéricos
    const sanitizedValue = value.replace(/\D/g, '');

    if (sanitizedValue.length <= 2) {
      return sanitizedValue; // Apenas dia
    } else if (sanitizedValue.length <= 4) {
      return `${sanitizedValue.slice(0, 2)}/${sanitizedValue.slice(2)}`; // Dia/Mês
    } else {
      return `${sanitizedValue.slice(0, 2)}/${sanitizedValue.slice(2, 4)}/${sanitizedValue.slice(4, 8)}`; // Dia/Mês/Ano
    }
  };

  const handleInputChange = (name, value) => {
    const formattedValue = name === 'date' ? formatInputDate(value) : value;
    setEventData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSaveEvent = async () => {
    if (!eventData.title || !eventData.date) {
      Alert.alert('Erro', 'Os campos Título e Data são obrigatórios!');
      return;
    }

    if (!isValidDate(eventData.date)) {
      Alert.alert('Erro', 'Por favor, insira uma data válida no formato DD/MM/AAAA.');
      return;
    }

    setIsSaving(true);
    const newEvent = {
      ...eventData,
      id: uuid.v4(),
      date: formatDate(eventData.date),
      type: eventType,
      status: 'pending',
    };

    try {
      console.log('Evento a ser salvo:', newEvent); // Debug
      await saveEvent(newEvent);
      Alert.alert('Sucesso', 'Evento salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o evento.');
      console.error('Erro ao salvar evento:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.header, { color: currentTheme.text }]}>Novo Evento</Text>
      <ScrollView>
        {eventFields[eventType]?.map((field) => (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: currentTheme.text }]}>{field.label}</Text>
            {field.type === 'textarea' ? (
              <TextInput
                style={[styles.textarea, { borderColor: currentTheme.primary, color: currentTheme.text }]}
                multiline
                numberOfLines={4}
                value={eventData[field.name] || ''}
                onChangeText={(value) => handleInputChange(field.name, value)}
              />
            ) : field.name === 'date' ? (
              <TextInput
                style={[styles.input, { borderColor: currentTheme.primary, color: currentTheme.text }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={currentTheme.text + '80'}
                keyboardType="numeric"
                value={eventData[field.name] || ''}
                onChangeText={(value) => handleInputChange(field.name, value)}
                maxLength={10} // Limita o input a 10 caracteres
              />
            ) : (
              <TextInput
                style={[styles.input, { borderColor: currentTheme.primary, color: currentTheme.text }]}
                placeholder={field.label}
                placeholderTextColor={currentTheme.text + '80'}
                value={eventData[field.name] || ''}
                onChangeText={(value) => handleInputChange(field.name, value)}
              />
            )}
          </View>
        ))}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isSaving ? currentTheme.secondary : currentTheme.primary }]}
            onPress={handleSaveEvent}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: currentTheme.secondary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  textarea: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default EventCreateScreen;
