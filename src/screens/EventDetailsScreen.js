// EventDetailsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Input, Button, FAB, Icon } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import * as NotificationService from '../services/notifications';
import { COLORS } from '../utils/common';
import Selector from '../components/Selector';

const COMPETENCIAS = {
  CIVEL: 'Cível',
  CONSUMIDOR: 'Consumidor',
  CRIMINAL: 'Criminal',
  TRABALHISTA: 'Trabalhista',
  PREVIDENCIARIO: 'Previdenciário',
  TRIBUTARIO: 'Tributário',
  FAMILIA: 'Família',
  ADMINISTRATIVO: 'Administrativo',
};

const TIPOS_COMPROMISSO = {
  AUDIENCIA: 'Audiência',
  REUNIAO: 'Reunião',
  PRAZO: 'Prazo',
  DESPACHO: 'Despacho',
  PERICIA: 'Perícia',
  JULGAMENTO: 'Julgamento',
  SUSTENTACAO: 'Sustentação Oral',
};

const formatDate = (dt) => {
  const date = new Date(dt);
  return isNaN(date) ? '' : date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (dt) => {
  const date = new Date(dt);
  return isNaN(date) ? '' : date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const validateForm = (formData) => {
  if (!formData.cliente.trim()) {
    return 'O campo "Cliente" é obrigatório.';
  }
  if (!formData.tipo) {
    return 'O campo "Tipo de Compromisso" é obrigatório.';
  }
  if (!formData.date) {
    return 'A data do compromisso é obrigatória.';
  }
  if (!(formData.date instanceof Date) || isNaN(formData.date.getTime()) || formData.date < new Date()) {
    return 'A data/hora não pode ser no passado.';
  }
  return null;
};

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingEvent = route.params?.event;
  const { addEvent, updateEvent, deleteEvent } = useEvents();

  const [formData, setFormData] = useState({
    cliente: '',
    tipo: '',
    date: new Date(),
    local: '',
    descricao: '',
    numeroProcesso: '',
    competencia: '',
    vara: '',
    comarca: '',
    estado: '',
    reu: '',
    telefoneCliente: '',
    emailCliente: '',
    telefoneReu: '',
    emailReu: '',
    juiz: '',
    promotor: '',
    perito: '',
    prepostoCliente: '',
    testemunhas: '',
    documentosNecessarios: '',
  });

  useEffect(() => {
    navigation.setOptions({
      title: editingEvent ? 'Editar Compromisso' : 'Novo Compromisso',
    });
    if (editingEvent) {
      const eventData = {
        ...editingEvent,
        date: editingEvent.date instanceof Date ? editingEvent.date : new Date(editingEvent.date)
      };
      setFormData(prev => ({ ...prev, ...eventData }));
    }
  }, [navigation, editingEvent]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      setTempDate(selectedDate || tempDate);
    }
  };

  const handleConfirmDate = () => {
    setFormData(prev => ({
      ...prev,
      date: new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate(),
        prev.date.getHours(),
        prev.date.getMinutes()
      )
    }));
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === 'set') {
      setTempDate(selectedTime || tempDate);
    }
  };

  const handleConfirmTime = () => {
    setFormData(prev => ({
      ...prev,
      date: new Date(
        prev.date.getFullYear(),
        prev.date.getMonth(),
        prev.date.getDate(),
        tempDate.getHours(),
        tempDate.getMinutes()
      )
    }));
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    const validationError = validateForm(formData);
    if (validationError) {
      Alert.alert('Erro', validationError);
      return;
    }

    try {
      const eventData = {
        ...formData,
        title: formData.cliente, // Mapeia o campo cliente para title
        type: formData.tipo?.toLowerCase() // Garante que o tipo fique em minúsculo para filtragem
      };
      
      if (editingEvent) {
        await updateEvent(eventData);
      } else {
        await addEvent(eventData);
      }
      navigation.goBack();
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao salvar compromisso');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente excluir este compromisso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(editingEvent.id);
              await refreshEvents();
              navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o compromisso.');
            }
          },
        },
      ]
    );
  };

  const renderMainForm = () => (
    <ScrollView style={styles.container}>
      <View style={styles.mainForm}>
        <Input
          label="Cliente *"
          value={formData.cliente}
          onChangeText={(value) => handleInputChange('cliente', value)}
          placeholder="Nome do cliente"
        />
        <Selector
          label="Tipo de Compromisso *"
          selectedValue={formData.tipo}
          options={TIPOS_COMPROMISSO}
          onSelect={(value) => handleInputChange('tipo', value)}
        />
        <View style={styles.dateTimeSection}>
          <View style={styles.dateTimeField}>
            <Text style={styles.label}>Data *</Text>
            <Button
              title={formatDate(formData.date)}
              onPress={() => setShowDatePicker(true)}
              type="outline"
            />
            {showDatePicker && (
              <>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.picker}
                />
                <Button
                  title="OK"
                  onPress={handleConfirmDate}
                  buttonStyle={styles.confirmButton}
                />
              </>
            )}
          </View>
          <View style={styles.dateTimeField}>
            <Text style={styles.label}>Hora *</Text>
            <Button
              title={formatTime(formData.date)}
              onPress={() => setShowTimePicker(true)}
              type="outline"
            />
            {showTimePicker && (
              <>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={styles.picker}
                />
                <Button
                  title="OK"
                  onPress={handleConfirmTime}
                  buttonStyle={styles.confirmButton}
                />
              </>
            )}
          </View>
        </View>
        <Input
          label="Local"
          value={formData.local}
          onChangeText={(value) => handleInputChange('local', value)}
          placeholder="Local do compromisso"
        />
        <Input
          label="Descrição"
          value={formData.descricao}
          onChangeText={(text) => handleInputChange('descricao', text)}
          multiline
          numberOfLines={3}
          placeholder="Descrição do compromisso"
        />
        <Input
          label="Número do Processo"
          value={formData.numeroProcesso}
          onChangeText={(text) => handleInputChange('numeroProcesso', text)}
          placeholder="0000000-00.0000.0.00.0000"
          keyboardType="numeric"
        />
        <Input
          label="Vara"
          value={formData.vara}
          onChangeText={(text) => handleInputChange('vara', text)}
          keyboardType="numeric"
        />
        <Input
          label="Comarca"
          value={formData.comarca}
          onChangeText={(text) => handleInputChange('comarca', text)}
        />
        <Input
          label="Estado"
          value={formData.estado}
          onChangeText={(text) => handleInputChange('estado', text)}
        />
        <Input
          label="Juiz"
          value={formData.juiz}
          onChangeText={(text) => handleInputChange('juiz', text)}
        />
        <Input
          label="Promotor"
          value={formData.promotor}
          onChangeText={(text) => handleInputChange('promotor', text)}
        />
        <Input
          label="Perito"
          value={formData.perito}
          onChangeText={(text) => handleInputChange('perito', text)}
        />
        <Input
          label="Testemunhas"
          value={formData.testemunhas}
          onChangeText={(text) => handleInputChange('testemunhas', text)}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Documentos Necessários"
          value={formData.documentosNecessarios}
          onChangeText={(text) => handleInputChange('documentosNecessarios', text)}
          multiline
          numberOfLines={4}
          placeholder="Liste os documentos necessários para o compromisso"
        />
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {renderMainForm()}
      <FAB
        title="Salvar"
        icon={{ name: 'save', color: 'white' }}
        color={COLORS.primary}
        placement="right"
        onPress={handleSave}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainForm: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#86939e',
  },
  dateTimeSection: {
    flexDirection: 'column',
    marginHorizontal: 10,
    marginBottom: 20,
    gap: 16,
  },
  dateTimeField: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    minHeight: 60,
  },
  picker: {
    width: '100%',
    height: 50,
    transform: [{ scale: 0.9 }],
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    marginTop: 10,
    width: '100%',
  },
});

export default EventDetailsScreen;
