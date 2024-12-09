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
import { lightTheme, darkTheme } from '../constants/colors';
import { eventFields } from '../constants/eventFields';
import uuid from 'react-native-uuid';

const EventCreateScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const [eventType, setEventType] = useState(route.params?.eventType || 'other');
  const [eventData, setEventData] = useState({});
  const [isSaving, setIsSaving] = useState(false); // Indicador de salvamento

  const handleInputChange = (name, value) => {
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = async () => {
    if (!eventData.title || !eventData.date) {
      Alert.alert('Erro', 'Os campos Título e Data são obrigatórios!');
      return;
    }

    setIsSaving(true);
    const newEvent = {
      ...eventData,
      id: uuid.v4(),
      type: eventType,
      status: 'pending',
    };

    try {
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

  const fields = eventFields[eventType] || [];

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.header, { color: currentTheme.text }]}>Novo Evento</Text>
      <ScrollView>
        {fields.map((field) => (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={[styles.label, { color: currentTheme.text }]}>{field.label}</Text>
            {field.type === 'textarea' ? (
              <TextInput
                style={[
                  styles.textarea,
                  { borderColor: currentTheme.primary, color: currentTheme.text },
                ]}
                multiline
                numberOfLines={4}
                value={eventData[field.name] || ''}
                onChangeText={(value) => handleInputChange(field.name, value)}
              />
            ) : (
              <TextInput
                style={[
                  styles.input,
                  { borderColor: currentTheme.primary, color: currentTheme.text },
                ]}
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
            style={[
              styles.saveButton,
              { backgroundColor: isSaving ? currentTheme.secondary : currentTheme.primary },
            ]}
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
