import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Text, Input, Button, Divider, ButtonGroup, FAB, Icon } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEvents } from '../contexts/EventContext';
import NotificationService from '../services/NotificationService';
import { COLORS } from '../utils/common';
import Selector from '../components/Selector';
import CustomDateTimePicker from '../components/CustomDateTimePicker';

// Constantes de opções
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

// Funções utilitárias
const formatDate = (dt) =>
  dt.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (dt) =>
  dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const validateForm = (formData) => {
  if (!formData.cliente.trim()) {
    return 'O campo "Cliente" é obrigatório.';
  }
  if (!formData.tipo) {
    return 'O campo "Tipo de Compromisso" é obrigatório.';
  }
  if (!formData.data) {
    return 'A data do compromisso é obrigatória.';
  }
  if (formData.data < new Date()) {
    return 'A data/hora não pode ser no passado.';
  }
  return null;
};

// Modal base para todos os passos
const StepModal = ({ visible, title, onClose, children }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView>{children}</ScrollView>
      </View>
    </View>
  </Modal>
);

// Componente principal
const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingEvent = route.params?.event;
  const { addEvent, updateEvent, deleteEvent } = useEvents();

  const [formData, setFormData] = useState({
    cliente: '',
    tipo: '',
    data: new Date(),
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showProcessInfo, setShowProcessInfo] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: editingEvent ? 'Editar Compromisso' : 'Novo Compromisso',
    });
    if (editingEvent) {
      setFormData((prev) => ({ ...prev, ...editingEvent }));
    }
  }, [navigation, editingEvent]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = (selectedDate) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      // Preserve the current time when changing date
      newDate.setHours(formData.data.getHours());
      newDate.setMinutes(formData.data.getMinutes());
      handleInputChange('data', newDate);
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (selectedTime) => {
    if (selectedTime) {
      const newDate = new Date(formData.data);
      // Update only time components
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      handleInputChange('data', newDate);
    }
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    const validationError = validateForm(formData);
    if (validationError) {
      Alert.alert('Erro', validationError);
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent(formData);
      } else {
        await addEvent(formData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o compromisso.');
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
              navigation.goBack();
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

        <TouchableOpacity
          style={styles.dateTimeContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.label}>Data *</Text>
          <Text style={styles.dateTimeText}>{formatDate(formData.data)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeContainer}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.label}>Hora *</Text>
          <Text style={styles.dateTimeText}>{formatTime(formData.data)}</Text>
        </TouchableOpacity>

        <CustomDateTimePicker
          visible={showDatePicker}
          mode="date"
          value={formData.data}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateChange}
        />

        <CustomDateTimePicker
          visible={showTimePicker}
          mode="time"
          value={formData.data}
          onClose={() => setShowTimePicker(false)}
          onConfirm={handleTimeChange}
        />

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

        <View style={styles.actionButtons}>
          <Button
            title="Informações do Processo"
            type="outline"
            icon={{ name: 'description', size: 20 }}
            onPress={() => setShowProcessInfo(true)}
            containerStyle={styles.actionButton}
          />
          <Button
            title="Participantes"
            type="outline"
            icon={{ name: 'people', size: 20 }}
            onPress={() => setShowParticipants(true)}
            containerStyle={styles.actionButton}
          />
          <Button
            title="Documentos"
            type="outline"
            icon={{ name: 'folder', size: 20 }}
            onPress={() => setShowDocuments(true)}
            containerStyle={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {renderMainForm()}

      <StepModal
        visible={showProcessInfo}
        title="Informações do Processo"
        onClose={() => setShowProcessInfo(false)}
      >
        <View style={styles.modalSection}>
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
        </View>
      </StepModal>

      <StepModal
        visible={showParticipants}
        title="Participantes"
        onClose={() => setShowParticipants(false)}
      >
        <View style={styles.modalSection}>
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
        </View>
      </StepModal>

      <StepModal
        visible={showDocuments}
        title="Documentos Necessários"
        onClose={() => setShowDocuments(false)}
      >
        <View style={styles.modalSection}>
          <Input
            label="Documentos Necessários"
            value={formData.documentosNecessarios}
            onChangeText={(text) => handleInputChange('documentosNecessarios', text)}
            multiline
            numberOfLines={4}
            placeholder="Liste os documentos necessários para o compromisso"
          />
        </View>
      </StepModal>

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
  dateTimeContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  datePicker: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  confirmButton: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    marginVertical: 8,
  },
});

export default EventDetailsScreen;
