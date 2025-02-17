import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Switch, Modal } from 'react-native';
import { Text, Input, Button, Divider, ButtonGroup, FAB } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import NotificationService from '../services/NotificationService';
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
  const { addEvent, updateEvent, deleteEvent } = useEvents();

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

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState('');

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Usa o método estático da classe NotificationService
        await NotificationService.requestPermissions();
      } catch (error) {
        console.error('Erro ao solicitar permissões:', error);
        Alert.alert(
          'Aviso',
          'Não foi possível obter permissão para enviar notificações'
        );
      }
    };

    checkPermissions();
  }, []);

  const updateNotificationMessage = useCallback(() => {
    if (!formData.data) return;

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
    const { cliente, tipo, data } = formData;

    // Validação dos campos obrigatórios
    if (!cliente) {
      Alert.alert('Erro', 'O campo "Cliente" é obrigatório.');
      return;
    }

    if (!tipo) {
      Alert.alert('Erro', 'O campo "Tipo de Compromisso" é obrigatório.');
      return;
    }

    // Verifica se a data está definida
    if (!data) {
      Alert.alert('Erro', 'A data do compromisso é obrigatória.');
      return;
    }

    // Log para depuração
    console.log('Data do compromisso:', data);

    // Validação do número do processo (opcional)
    const processNumberPattern = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/; // Regex para validar o formato CNJ
    if (formData.numeroProcesso && !processNumberPattern.test(formData.numeroProcesso)) {
      Alert.alert('Erro', 'Se fornecido, o número do processo deve seguir o padrão CNJ: 0000000-00.0000.0.00.0000');
      return;
    }

    // Verifica se a data/hora não é no passado
    if (data < new Date()) {
      Alert.alert('Erro', 'A data/hora não pode ser no passado.');
      return;
    }

    const eventData = {
      title: formData.descricao.trim(),
      date: data.toISOString(), // Certifique-se de que a data está no formato correto
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

      // Log para verificar o evento antes de agendar a notificação
      console.log('Evento para agendar notificação:', savedEvent);

      // Agenda a notificação usando o método estático
      const notificationId = await NotificationService.scheduleEventNotification(savedEvent);
      if (notificationId) {
        savedEvent.notificationId = notificationId;
      }

      await NotificationService.scheduleEventNotification(savedEvent, customMessage);
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o compromisso. Por favor, tente novamente.');
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

  const handleProcessNumberChange = (text) => {
    // Remove caracteres não numéricos
    let numericText = text.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    // Limita a entrada a 20 caracteres
    if (numericText.length > 20) {
      numericText = numericText.slice(0, 20); // Mantém apenas os 20 primeiros caracteres
    }

    // Formata o número do processo conforme o padrão
    let formattedText = '';
    if (numericText.length <= 7) {
      formattedText = numericText; // Apenas os 7 primeiros dígitos
    } else if (numericText.length <= 9) {
      formattedText = `${numericText.slice(0, 7)}-${numericText.slice(7)}`; // Adiciona o dígito verificador
    } else if (numericText.length <= 13) {
      formattedText = `${numericText.slice(0, 7)}-${numericText.slice(7, 9)}.${numericText.slice(9)}`; // Adiciona o ano
    } else if (numericText.length <= 17) {
      formattedText = `${numericText.slice(0, 7)}-${numericText.slice(7, 9)}.${numericText.slice(9, 13)}.${numericText.slice(13)}`; // Adiciona o J
    } else {
      formattedText = `${numericText.slice(0, 7)}-${numericText.slice(7, 9)}.${numericText.slice(9, 13)}.${numericText.slice(13, 14)}.${numericText.slice(14, 16)}.${numericText.slice(16)}`; // Adiciona o TR e OOOO
    }

    // Verifica se o ano é válido (4 dígitos)
    if (formattedText.length >= 13) {
      const year = formattedText.slice(9, 13);
      if (isNaN(year) || year.length !== 4) {
        Alert.alert('Erro', 'O ano deve ser um número de 4 dígitos.');
        return;
      }
    }

    setFormData(prev => ({ ...prev, numeroProcesso: formattedText }));
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

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este compromisso?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(editingEvent.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o compromisso');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenModal = (field) => {
    setCurrentField(field);
    setModalVisible(true);
  };

  const handleSelect = (value) => {
    setFormData((prev) => ({ ...prev, [currentField]: value }));
    setModalVisible(false);
  };

  const renderModalContent = () => {
    switch (currentField) {
      case 'competencia':
        return (
          <View>
            <Text>Selecione a Competência:</Text>
            <Button title="Cível" onPress={() => handleSelect('Cível')} />
            <Button title="Criminal" onPress={() => handleSelect('Criminal')} />
          </View>
        );
      case 'vara':
        return (
          <View>
            <Text>Selecione a Vara:</Text>
            <Button title="Vara 1" onPress={() => handleSelect('Vara 1')} />
            <Button title="Vara 2" onPress={() => handleSelect('Vara 2')} />
          </View>
        );
      case 'comarca':
        return (
          <View>
            <Text>Selecione a Comarca:</Text>
            <Button title="Comarca A" onPress={() => handleSelect('Comarca A')} />
            <Button title="Comarca B" onPress={() => handleSelect('Comarca B')} />
          </View>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Tela de Cadastro',
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Novo Compromisso</Text>
          <Text h4 style={styles.sectionTitle}>Dados do Processo</Text>
          <View style={styles.section}>
            <Input
              label="Número do Processo"
              value={formData.numeroProcesso}
              onChangeText={handleProcessNumberChange}
              placeholder="Ex: 0000000-00.0000.0.00.0000"
              keyboardType="numeric"
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
          <View style={styles.buttonContainer}>
            {editingEvent && (
              <Button
                title="Excluir"
                onPress={handleDelete}
                buttonStyle={[styles.button, styles.deleteButton]}
              />
            )}
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {renderModalContent()}
            <Button title="Fechar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <FAB
        icon={{ name: 'save', color: 'white' }}
        color="#6200ee"
        placement="right"
        style={styles.fab}
        onPress={handleSave}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { 
    marginBottom: 24, 
    color: '#000', 
    textAlign: 'center', 
    fontSize: 24,
    fontWeight: 'bold',
  },
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    height: 50,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default EventDetailsScreen;