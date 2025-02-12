import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { Text, Input, Button, Divider, ButtonGroup } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import { requestPermissions, scheduleEventNotification } from '../services/NotificationService';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../utils/common';

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

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingEvent = route.params?.event;
  const { addEvent, updateEvent } = useEvents();

  const [formData, setFormData] = useState({
    // Dados do Processo
    numeroProcesso: '',
    competencia: '',
    vara: '',
    comarca: '',
    estado: '',
    
    // Partes do Processo
    cliente: '',
    reu: '',
    
    // Contatos
    telefoneCliente: '',
    emailCliente: '',
    telefoneReu: '',
    emailReu: '',
    
    // Dados do Compromisso
    tipo: '',
    data: new Date(),
    descricao: '',
    observacoes: '',
    
    // Localização
    local: '',
    sala: '',
    andar: '',
    predio: '',
    
    // Valores
    valorCausa: '',
    honorarios: '',
    
    // Status e Prazos
    statusProcesso: '',
    proximoPrazo: '',
    
    // Documentos Necessários
    documentosNecessarios: '',
    
    // Outros Participantes
    juiz: '',
    promotor: '',
    perito: '',
    prepostoCliente: '',
    testemunhas: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customMessage, setCustomMessage] = useState(`Você tem um compromisso "${formData.descricao}" amanhã`);
  const [sendEmailFlag, setSendEmailFlag] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const updateNotificationMessage = useCallback(() => {
    const formattedDate = formData.data.toLocaleDateString('pt-BR');
    const formattedTime = formData.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const eventLabel = TIPOS_COMPROMISSO[formData.tipo] || '';
    setCustomMessage(
      `Compromisso: ${eventLabel} de ${formData.cliente} no dia ${formattedDate} às ${formattedTime} no Fórum de ${formData.local}`
    );
  }, [formData.data, formData.tipo, formData.cliente, formData.local]);

  useEffect(() => {
    updateNotificationMessage();
  }, [formData.data, formData.tipo, formData.cliente, formData.local, updateNotificationMessage]);

  const handleSave = async () => {
    if (!formData.descricao.trim() || !formData.local.trim() || !formData.cliente.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }
    if (formData.data < new Date()) {
      Alert.alert('Erro', 'A data/hora não pode ser no passado.');
      return;
    }
    const eventData = {
      title: formData.descricao.trim(),
      date: formData.data.toISOString(),
      type: formData.tipo,
      location: formData.local.trim(),
      client: formData.cliente.trim(),
      description: formData.descricao.trim(),
    };
    try {
      let savedEvent;
      if (editingEvent) {
        const success = await updateEvent(editingEvent.id, eventData, sendEmailFlag);
        if (success) {
          savedEvent = { ...eventData, id: editingEvent.id };
        }
      } else {
        savedEvent = await addEvent(eventData, sendEmailFlag);
      }
      if (!savedEvent) throw new Error('Falha ao salvar compromisso');
      await scheduleEventNotification(savedEvent, customMessage);
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao salvar o compromisso. Por favor, tente novamente.'
      );
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setFormData(prev => ({ ...prev, data: new Date(selectedDate) }));
      updateNotificationMessage();
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const newDate = new Date(formData.data);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setFormData(prev => ({ ...prev, data: newDate }));
      updateNotificationMessage();
    }
  };

  const formatDate = (dt) =>
    dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const formatTime = (dt) =>
    dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const handleDescricaoChange = (text) => {
    setFormData(prev => ({ ...prev, descricao: text }));
    updateNotificationMessage();
  };
  const handleClienteChange = (text) => {
    setFormData(prev => ({ ...prev, cliente: text }));
    updateNotificationMessage();
  };
  const handleLocalChange = (text) => {
    setFormData(prev => ({ ...prev, local: text }));
    updateNotificationMessage();
  };

  // Função atualizada para renderizar os seletores
  const renderSelector = (label, value, options, onChange) => {
    const buttons = Object.values(options);
    // Divide os botões em linhas de 2 para melhor visualização
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) {
      rows.push(buttons.slice(i, i + 2));
    }

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>{label}</Text>
        {rows.map((row, rowIndex) => (
          <ButtonGroup
            key={rowIndex}
            buttons={row}
            selectedIndex={row.indexOf(value)}
            onPress={(index) => {
              const actualIndex = rowIndex * 2 + index;
              onChange(Object.keys(options)[actualIndex]);
            }}
            containerStyle={styles.buttonGroupContainer}
            selectedButtonStyle={styles.selectedButton}
            buttonStyle={styles.selectorButton}
            textStyle={styles.selectorButtonText}
            selectedTextStyle={styles.selectedButtonText}
          />
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView>
        <View style={styles.content}>
          <Text h4 style={styles.title}>
            {editingEvent ? 'Editar Compromisso' : 'Novo Compromisso'}
          </Text>
          <Text h4 style={styles.sectionTitle}>Dados do Processo</Text>
          <View style={styles.section}>
            <Input
              label="Número do Processo"
              value={formData.numeroProcesso}
              onChangeText={(value) => setFormData(prev => ({ ...prev, numeroProcesso: value }))}
              placeholder="0000000-00.0000.0.00.0000"
            />
            
            {renderSelector(
              'Competência',
              COMPETENCIAS[formData.competencia],
              COMPETENCIAS,
              (value) => setFormData(prev => ({ ...prev, competencia: value }))
            )}

            <Input
              label="Vara"
              value={formData.vara}
              onChangeText={(value) => setFormData(prev => ({ ...prev, vara: value }))}
              placeholder="Ex: 1ª Vara Cível"
            />

            <Input
              label="Comarca"
              value={formData.comarca}
              onChangeText={(value) => setFormData(prev => ({ ...prev, comarca: value }))}
            />

            <Input
              label="Estado"
              value={formData.estado}
              onChangeText={(value) => setFormData(prev => ({ ...prev, estado: value }))}
            />
          </View>

          <Divider style={styles.divider} />
          <Text h4 style={styles.sectionTitle}>Partes do Processo</Text>
          <View style={styles.section}>
            <Input
              label="Cliente"
              value={formData.cliente}
              onChangeText={handleClienteChange}
            />
            
            <Input
              label="Telefone do Cliente"
              value={formData.telefoneCliente}
              onChangeText={(value) => setFormData(prev => ({ ...prev, telefoneCliente: value }))}
              keyboardType="phone-pad"
            />

            <Input
              label="E-mail do Cliente"
              value={formData.emailCliente}
              onChangeText={(value) => setFormData(prev => ({ ...prev, emailCliente: value }))}
              keyboardType="email-address"
            />

            <Input
              label="Réu/Parte Contrária"
              value={formData.reu}
              onChangeText={(value) => setFormData(prev => ({ ...prev, reu: value }))}
            />

            <Input
              label="Telefone do Réu"
              value={formData.telefoneReu}
              onChangeText={(value) => setFormData(prev => ({ ...prev, telefoneReu: value }))}
              keyboardType="phone-pad"
            />

            <Input
              label="E-mail do Réu"
              value={formData.emailReu}
              onChangeText={(value) => setFormData(prev => ({ ...prev, emailReu: value }))}
              keyboardType="email-address"
            />
          </View>

          <Divider style={styles.divider} />
          <Text h4 style={styles.sectionTitle}>Dados do Compromisso</Text>
          <View style={styles.section}>
            {renderSelector(
              'Tipo de Compromisso',
              TIPOS_COMPROMISSO[formData.tipo],
              TIPOS_COMPROMISSO,
              (value) => setFormData(prev => ({ ...prev, tipo: value }))
            )}

            <Text style={styles.label}>Data e Hora</Text>
            <View style={styles.dateContainer}>
              <Button
                title={formatDate(formData.data)}
                type="outline"
                icon={{ name: 'calendar-today', size: 20, color: '#6200ee' }}
                buttonStyle={styles.dateButton}
                titleStyle={styles.dateButtonText}
                onPress={() => setShowDatePicker(true)}
              />
            </View>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={formData.data}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  locale="pt-BR"
                />
                <Button title="OK" onPress={() => setShowDatePicker(false)} buttonStyle={styles.okButton} />
              </View>
            )}
            <View style={styles.timeContainer}>
              <Button
                title={formatTime(formData.data)}
                type="outline"
                icon={{ name: 'access-time', size: 20, color: '#6200ee' }}
                buttonStyle={styles.dateButton}
                titleStyle={styles.dateButtonText}
                onPress={() => setShowTimePicker(true)}
              />
            </View>
            {showTimePicker && (
              <View style={styles.timePickerContainer}>
                <DateTimePicker
                  value={formData.data}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  locale="pt-BR"
                />
                <Button title="OK" onPress={() => setShowTimePicker(false)} buttonStyle={styles.okButton} />
              </View>
            )}

            <Input
              label="Local"
              value={formData.local}
              onChangeText={handleLocalChange}
            />

            <Input
              label="Sala/Andar/Prédio"
              value={formData.sala}
              onChangeText={(value) => setFormData(prev => ({ ...prev, sala: value }))}
              placeholder="Ex: Sala 302, 3º andar, Prédio Principal"
            />

            <Input
              label="Descrição"
              value={formData.descricao}
              onChangeText={handleDescricaoChange}
              multiline
              numberOfLines={3}
            />

            <Input
              label="Documentos Necessários"
              value={formData.documentosNecessarios}
              onChangeText={(value) => setFormData(prev => ({ ...prev, documentosNecessarios: value }))}
              multiline
              numberOfLines={3}
              placeholder="Liste os documentos necessários para o compromisso"
            />
          </View>

          <Divider style={styles.divider} />
          <Text h4 style={styles.sectionTitle}>Outros Participantes</Text>
          <View style={styles.section}>
            <Input
              label="Juiz"
              value={formData.juiz}
              onChangeText={(value) => setFormData(prev => ({ ...prev, juiz: value }))}
            />

            <Input
              label="Promotor"
              value={formData.promotor}
              onChangeText={(value) => setFormData(prev => ({ ...prev, promotor: value }))}
            />

            <Input
              label="Perito"
              value={formData.perito}
              onChangeText={(value) => setFormData(prev => ({ ...prev, perito: value }))}
            />

            <Input
              label="Preposto do Cliente"
              value={formData.prepostoCliente}
              onChangeText={(value) => setFormData(prev => ({ ...prev, prepostoCliente: value }))}
            />

            <Input
              label="Testemunhas"
              value={formData.testemunhas}
              onChangeText={(value) => setFormData(prev => ({ ...prev, testemunhas: value }))}
              multiline
              numberOfLines={3}
              placeholder="Nome e qualificação das testemunhas"
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enviar por e-mail</Text>
            <Switch value={sendEmailFlag} onValueChange={setSendEmailFlag} />
          </View>
          <Button
            title="Salvar"
            icon={{ name: 'save', size: 20, color: 'white' }}
            buttonStyle={styles.saveButton}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { marginBottom: 24, color: '#000', textAlign: 'center' },
  sectionTitle: {
    padding: 16,
    paddingBottom: 0,
    color: COLORS.primary,
  },
  label: { fontSize: 16, color: '#86939e', marginBottom: 8, marginLeft: 10 },
  section: { padding: 16 },
  picker: {
    marginHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e0e0e0',
  },
  dateContainer: { marginBottom: 16 },
  timeContainer: { marginBottom: 16 },
  dateButton: { borderColor: '#6200ee', borderRadius: 10, height: 50 },
  dateButtonText: { color: '#6200ee' },
  datePickerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  okButton: { backgroundColor: '#6200ee', borderRadius: 10, height: 50, marginTop: 16 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  switchLabel: { flex: 1, fontSize: 16, color: '#86939e' },
  saveButton: { backgroundColor: '#6200ee', borderRadius: 10, height: 50 },
  selectorContainer: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  selectorLabel: {
    fontSize: 16,
    color: '#86939e',
    marginBottom: 12,
    marginLeft: 10,
    fontWeight: '600',
  },
  buttonGroupContainer: {
    marginBottom: 8,
    height: 45,
    borderRadius: 8,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  selectorButton: {
    backgroundColor: 'white',
    padding: 12,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
  },
  selectorButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default EventDetailsScreen;