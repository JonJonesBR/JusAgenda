// EventDetailsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Text, Input, Button, FAB, Icon, Divider, Badge } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native'; // Added CommonActions
import { useEvents } from '../contexts/EventContext';
import { useTheme } from '../contexts/ThemeContext';
import * as NotificationService from '../services/notifications';
import { COLORS, EVENT_TYPES, AREAS_JURIDICAS, FASES_PROCESSUAIS, PRIORIDADES, formatarNumeroProcesso } from '../utils/common';
import Selector from '../components/Selector';

// Converter EVENT_TYPES para formato legível ao usuário
const TIPOS_COMPROMISSO = Object.entries(EVENT_TYPES).reduce((acc, [key, value]) => {
  // Converte o value para um label legivelmente formatado
  const label = value
    .split('')
    .map((char, i) => (i === 0 ? char.toUpperCase() : char))
    .join('')
    .replace(/([A-Z])/g, ' $1')
    .trim();

  return { ...acc, [value]: label };
}, {});

// Converter AREAS_JURIDICAS para formato legível
const COMPETENCIAS = Object.entries(AREAS_JURIDICAS).reduce((acc, [key, value]) => {
  // Formata para primeira letra maiúscula
  const label = value.charAt(0).toUpperCase() + value.slice(1);
  return { ...acc, [value]: label };
}, {});

// Converter PRIORIDADES para formato legível
const PRIORIDADES_FORMATADAS = Object.entries(PRIORIDADES).reduce((acc, [key, value]) => {
  const label = value.charAt(0).toUpperCase() + value.slice(1);
  return { ...acc, [value]: label };
}, {});

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

  // Verifica se a data é válida
  if (!(formData.date instanceof Date) || isNaN(formData.date.getTime())) {
    return 'A data informada é inválida. Por favor, selecione novamente.';
  }

  // Verifica se a data é no passado apenas se não for um prazo (que pode ser retrospectivo)
  if (formData.tipo !== EVENT_TYPES.PRAZO) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - 10); // Dá uma margem de 10 minutos
    if (formData.date < now) {
      return 'A data/hora não pode ser no passado.';
    }
  }

  // Validações específicas por tipo de compromisso
  if (formData.tipo === EVENT_TYPES.AUDIENCIA && !formData.local.trim()) {
    return 'Para audiências, o campo "Local" é obrigatório.';
  }

  if ([EVENT_TYPES.AUDIENCIA, EVENT_TYPES.JULGAMENTO, EVENT_TYPES.PERICIA].includes(formData.tipo)
      && !formData.numeroProcesso.trim()) {
    return 'Para este tipo de compromisso, o número do processo é obrigatório.';
  }

  return null;
};

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editingEvent = route.params?.event;
  const { addEvent, updateEvent, deleteEvent, refreshEvents } = useEvents();
  const { theme, isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    cliente: '',
    tipo: '',
    date: new Date(),
    local: '',
    descricao: '',
    numeroProcesso: '',
    competencia: '',
    fase: '',
    prioridade: PRIORIDADES.MEDIA,
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
    observacoes: '',
    valor: '',
    honorarios: '',
    prazoDias: '',
  });

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeSection, setActiveSection] = useState('main');

  // Adiciona estado para acompanhar o progresso do salvamento
  const [isSaving, setIsSaving] = useState(false);

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

      // Se o evento já tem um processo ou é de certo tipo, abra as opções avançadas
      if (eventData.numeroProcesso ||
          [EVENT_TYPES.AUDIENCIA, EVENT_TYPES.JULGAMENTO, EVENT_TYPES.PERICIA].includes(eventData.tipo)) {
        setShowAdvancedOptions(true);
      }
    }
  }, [navigation, editingEvent]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Formatação especial para número de processo
    if (field === 'numeroProcesso') {
      const formattedValue = formatarNumeroProcesso(value);
      if (formattedValue !== value) {
        setFormData((prev) => ({ ...prev, numeroProcesso: formattedValue }));
      }
    }

    // Expande automaticamente opções avançadas quando seleciona certos tipos
    if (field === 'tipo' &&
        [EVENT_TYPES.AUDIENCIA, EVENT_TYPES.JULGAMENTO, EVENT_TYPES.PERICIA,
         EVENT_TYPES.SUSTENTACAO, EVENT_TYPES.CITACAO].includes(value)) {
      setShowAdvancedOptions(true);
      if (activeSection === 'main') {
        setActiveSection('processo');
      }
    }
  }, [activeSection]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    // Atualiza tempDate quando formData.date muda
    setTempDate(formData.date);
  }, [formData.date]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate; // Use selectedDate if available

    if (Platform.OS === 'android') {
      setShowDatePicker(false); // Hide picker on Android regardless of action
      if (event.type === 'set' && currentDate instanceof Date && !isNaN(currentDate.getTime())) {
        // Directly update date for Android on confirmation
        const newDate = new Date(formData.date);
        newDate.setFullYear(currentDate.getFullYear());
        newDate.setMonth(currentDate.getMonth());
        newDate.setDate(currentDate.getDate());

        // Perform past date check
        if (formData.tipo && formData.tipo !== EVENT_TYPES.PRAZO) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const dateToCheck = new Date(newDate);
          dateToCheck.setHours(0, 0, 0, 0);

          if (dateToCheck < now) {
            Alert.alert(
              'Atenção',
              'Você selecionou uma data no passado. Para compromissos que não são prazos, recomendamos datas futuras.',
              [
                { text: 'Manter esta data', onPress: () => updateDate(newDate) },
                { text: 'Cancelar', style: 'cancel' }
              ]
            );
            return; // Don't update automatically if needs confirmation
          }
        }
        updateDate(newDate); // Update state directly
      } else if (event.type === 'dismissed') {
        // User cancelled the picker
      } else if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
         Alert.alert('Erro', 'Data inválida selecionada. Por favor, tente novamente.');
      }
    } else {
      // iOS: Update tempDate for confirmation button
      if (currentDate instanceof Date && !isNaN(currentDate.getTime())) {
        setTempDate(currentDate);
      } else if (selectedDate) { // Only alert if a selection was made but invalid
         Alert.alert('Erro', 'Data inválida selecionada. Por favor, tente novamente.');
      }
    }
  };

  // Keep handleConfirmDate for iOS button
  const handleConfirmDate = () => {
    // Preserva a hora atual ao atualizar a data (using tempDate for iOS)
    const newDate = new Date(formData.date);
    newDate.setFullYear(tempDate.getFullYear());
    newDate.setMonth(tempDate.getMonth());
    newDate.setDate(tempDate.getDate());

    // Verifica se é uma data passada (apenas para tipos diferentes de PRAZO)
    if (formData.tipo && formData.tipo !== EVENT_TYPES.PRAZO) {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas as datas
      const dateToCheck = new Date(newDate);
      dateToCheck.setHours(0, 0, 0, 0);

      if (dateToCheck < now) {
        Alert.alert(
          'Atenção',
          'Você selecionou uma data no passado. Para compromissos que não são prazos, recomendamos datas futuras.',
          [
            { text: 'Manter esta data', onPress: () => updateDate(newDate) },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        return; // Don't update automatically if needs confirmation
      }
    }
    updateDate(newDate); // Update state
  };

  // Keep updateDate function
  const updateDate = (newDate) => {
    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
    // No need to hide picker here, handled in handleDateChange/handleConfirmDate
  };


  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || tempDate; // Use selectedTime if available

    if (Platform.OS === 'android') {
      setShowTimePicker(false); // Hide picker on Android regardless of action
      if (event.type === 'set' && currentTime instanceof Date && !isNaN(currentTime.getTime())) {
        // Directly update time for Android on confirmation
        const newDate = new Date(formData.date);
        newDate.setHours(currentTime.getHours());
        newDate.setMinutes(currentTime.getMinutes());

        setFormData(prev => ({
          ...prev,
          date: newDate
        }));
      } else if (event.type === 'dismissed') {
        // User cancelled the picker
      } else if (!(currentTime instanceof Date) || isNaN(currentTime.getTime())) {
        Alert.alert('Erro', 'Horário inválido selecionado. Por favor, tente novamente.');
      }
    } else {
      // iOS: Update tempDate for confirmation button
      if (currentTime instanceof Date && !isNaN(currentTime.getTime())) {
        setTempDate(currentTime);
      } else if (selectedTime) { // Only alert if a selection was made but invalid
        Alert.alert('Erro', 'Horário inválido selecionado. Por favor, tente novamente.');
      }
    }
  };

  // Keep handleConfirmTime for iOS button
  const handleConfirmTime = () => {
    // Preserva a data atual ao atualizar a hora (using tempDate for iOS)
    const newDate = new Date(formData.date);
    newDate.setHours(tempDate.getHours());
    newDate.setMinutes(tempDate.getMinutes());

    setFormData(prev => ({
      ...prev,
      date: newDate
    }));
    setShowTimePicker(false); // Hide picker after iOS confirmation
  };

  const navigateHome = () => {
    // Navigate explicitly to the Home tab and its initial screen
    navigation.navigate('Home', { screen: 'HomeScreen' });
  };

  const handleSave = async () => {
    const validationError = validateForm(formData);
    if (validationError) {
      Alert.alert('Erro', validationError);
      return;
    }

    setIsSaving(true);
    try {
      // Certifica-se de que o tipo selecionado é válido
      if (!formData.tipo || !Object.values(EVENT_TYPES).includes(formData.tipo)) {
        Alert.alert('Erro', 'Selecione um tipo de compromisso válido.');
        setIsSaving(false);
        return;
      }

      const eventData = {
        ...formData,
        title: formData.cliente, // Mapeia o campo cliente para title
        type: formData.tipo // Mantém o tipo como no formData
      };

      let success = false;
      if (editingEvent) {
        success = await updateEvent({...eventData, id: editingEvent.id});
      } else {
        success = await addEvent(eventData);
      }

      if (!success) {
        throw new Error('Falha ao salvar o compromisso.');
      }

      // Verifica se o evento foi salvo e oferece configuração de lembrete
      Alert.alert(
        'Compromisso Salvo',
        'Deseja configurar um lembrete para este compromisso?',
        [
          {
            text: 'Não',
            onPress: navigateHome, // Navigate home
          },
          {
            text: 'Sim',
            onPress: async () => {
              try {
                // Calcular 30 minutos antes do evento
                const reminderTime = new Date(eventData.date.getTime());
                reminderTime.setMinutes(reminderTime.getMinutes() - 30);

                // Verifica se o lembrete seria para o passado
                const now = new Date();
                if (reminderTime <= now) {
                  throw new Error('Não é possível configurar um lembrete para o passado.');
                }

                await NotificationService.scheduleNotification({
                  title: `Lembrete: ${eventData.cliente}`,
                  body: `${eventData.tipo} em ${formatTime(eventData.date)}${eventData.local ? ` em ${eventData.local}` : ''}`,
                  time: reminderTime.getTime(),
                });

                Alert.alert('Lembrete Configurado', 'Você receberá uma notificação 30 minutos antes do compromisso.');
                navigateHome(); // Navigate home
              } catch (error) {
                Alert.alert('Erro', error.message || 'Não foi possível configurar o lembrete.');
                navigateHome(); // Navigate home even if reminder fails
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao salvar compromisso. Verifique os dados e tente novamente.');
    } finally {
      setIsSaving(false);
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
              navigateHome(); // Navigate home after delete
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o compromisso.');
            }
          },
        },
      ]
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'main' && styles.activeTab]}
        onPress={() => setActiveSection('main')}
      >
        <Text style={[styles.tabText, activeSection === 'main' && styles.activeTabText]}>
          Principal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'processo' && styles.activeTab]}
        onPress={() => {
          setActiveSection('processo');
          setShowAdvancedOptions(true);
        }}
      >
        <Text style={[styles.tabText, activeSection === 'processo' && styles.activeTabText]}>
          Processo
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'partes' && styles.activeTab]}
        onPress={() => {
          setActiveSection('partes');
          setShowAdvancedOptions(true);
        }}
      >
        <Text style={[styles.tabText, activeSection === 'partes' && styles.activeTabText]}>
          Partes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeSection === 'extra' && styles.activeTab]}
        onPress={() => {
          setActiveSection('extra');
          setShowAdvancedOptions(true);
        }}
      >
        <Text style={[styles.tabText, activeSection === 'extra' && styles.activeTabText]}>
          Extras
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMainForm = () => (
    <View style={styles.mainForm}>
      <Input
        label="Cliente *"
        value={formData.cliente}
        onChangeText={(value) => handleInputChange('cliente', value)}
        placeholder="Nome do cliente"
        leftIcon={{ type: 'material', name: 'person', color: theme.colors.primary }}
      />
      <Selector
        label="Tipo de Compromisso *"
        selectedValue={formData.tipo}
        options={TIPOS_COMPROMISSO}
        onSelect={(value) => handleInputChange('tipo', value)}
        placeholder="Selecione o tipo de compromisso"
        required={true}
      />

      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeField}>
          <Text style={styles.label}>Data *</Text>
          <Button
            title={formatDate(formData.date)}
            onPress={() => setShowDatePicker(true)}
            type="outline"
            icon={{ name: 'calendar', type: 'font-awesome', color: theme.colors.primary, size: 18 }}
            iconRight
          />
          {showDatePicker && (
            <>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={styles.picker}
              />
              {Platform.OS === 'ios' && (
                <Button
                  title="Confirmar Data"
                  onPress={handleConfirmDate}
                  buttonStyle={styles.confirmButton}
                />
              )}
            </>
          )}
        </View>
        <View style={styles.dateTimeField}>
          <Text style={styles.label}>Hora *</Text>
          <Button
            title={formatTime(formData.date)}
            onPress={() => setShowTimePicker(true)}
            type="outline"
            icon={{ name: 'clock-o', type: 'font-awesome', color: theme.colors.primary, size: 18 }}
            iconRight
          />
          {showTimePicker && (
            <>
              <DateTimePicker
                value={tempDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.picker}
              />
              {Platform.OS === 'ios' && (
                <Button
                  title="Confirmar Hora"
                  onPress={handleConfirmTime}
                  buttonStyle={styles.confirmButton}
                />
              )}
            </>
          )}
        </View>
      </View>

      <Input
        label="Local"
        value={formData.local}
        onChangeText={(value) => handleInputChange('local', value)}
        placeholder="Local do compromisso"
        leftIcon={{ type: 'material', name: 'place', color: theme.colors.primary }}
      />

      <Selector
        label="Prioridade"
        selectedValue={formData.prioridade}
        options={PRIORIDADES_FORMATADAS}
        onSelect={(value) => handleInputChange('prioridade', value)}
      />

      <Input
        label="Descrição"
        value={formData.descricao}
        onChangeText={(text) => handleInputChange('descricao', text)}
        multiline
        numberOfLines={3}
        placeholder="Descrição do compromisso"
        leftIcon={{ type: 'material', name: 'description', color: theme.colors.primary }}
      />

      {formData.tipo === EVENT_TYPES.PRAZO && (
        <Input
          label="Prazo em Dias"
          value={formData.prazoDias}
          onChangeText={(text) => handleInputChange('prazoDias', text)}
          placeholder="Número de dias"
          keyboardType="numeric"
          leftIcon={{ type: 'material', name: 'timer', color: theme.colors.primary }}
        />
      )}
    </View>
  );

  const renderProcessoForm = () => (
    <View style={styles.mainForm}>
      <Input
        label="Número do Processo"
        value={formData.numeroProcesso}
        onChangeText={(text) => handleInputChange('numeroProcesso', text)}
        placeholder="0000000-00.0000.0.00.0000"
        keyboardType="numeric"
        leftIcon={{ type: 'material', name: 'folder', color: theme.colors.primary }}
      />

      <Selector
        label="Área Jurídica"
        selectedValue={formData.competencia}
        options={COMPETENCIAS}
        onSelect={(value) => handleInputChange('competencia', value)}
      />

      <Selector
        label="Fase Processual"
        selectedValue={formData.fase}
        options={FASES_PROCESSUAIS}
        onSelect={(value) => handleInputChange('fase', value)}
      />

      <Input
        label="Vara"
        value={formData.vara}
        onChangeText={(text) => handleInputChange('vara', text)}
        placeholder="Número da vara"
        leftIcon={{ type: 'material', name: 'gavel', color: theme.colors.primary }}
      />

      <Input
        label="Comarca"
        value={formData.comarca}
        onChangeText={(text) => handleInputChange('comarca', text)}
        placeholder="Nome da comarca"
        leftIcon={{ type: 'material', name: 'location-city', color: theme.colors.primary }}
      />

      <Input
        label="Estado"
        value={formData.estado}
        onChangeText={(text) => handleInputChange('estado', text)}
        placeholder="UF"
        leftIcon={{ type: 'material', name: 'flag', color: theme.colors.primary }}
      />

      <Input
        label="Valor da Causa"
        value={formData.valor}
        onChangeText={(text) => handleInputChange('valor', text)}
        placeholder="R$ 0,00"
        keyboardType="numeric"
        leftIcon={{ type: 'material', name: 'attach-money', color: theme.colors.primary }}
      />

      <Input
        label="Honorários"
        value={formData.honorarios}
        onChangeText={(text) => handleInputChange('honorarios', text)}
        placeholder="R$ 0,00"
        keyboardType="numeric"
        leftIcon={{ type: 'material', name: 'payment', color: theme.colors.primary }}
      />
    </View>
  );

  const renderPartesForm = () => (
    <View style={styles.mainForm}>
      <Input
        label="Réu/Parte Contrária"
        value={formData.reu}
        onChangeText={(text) => handleInputChange('reu', text)}
        placeholder="Nome da parte contrária"
        leftIcon={{ type: 'material', name: 'person-outline', color: theme.colors.primary }}
      />

      <Input
        label="Telefone do Cliente"
        value={formData.telefoneCliente}
        onChangeText={(text) => handleInputChange('telefoneCliente', text)}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        leftIcon={{ type: 'material', name: 'phone', color: theme.colors.primary }}
      />

      <Input
        label="Email do Cliente"
        value={formData.emailCliente}
        onChangeText={(text) => handleInputChange('emailCliente', text)}
        placeholder="cliente@exemplo.com"
        keyboardType="email-address"
        leftIcon={{ type: 'material', name: 'email', color: theme.colors.primary }}
      />

      <Input
        label="Telefone da Parte Contrária"
        value={formData.telefoneReu}
        onChangeText={(text) => handleInputChange('telefoneReu', text)}
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        leftIcon={{ type: 'material', name: 'phone', color: theme.colors.primary }}
      />

      <Input
        label="Email da Parte Contrária"
        value={formData.emailReu}
        onChangeText={(text) => handleInputChange('emailReu', text)}
        placeholder="reu@exemplo.com"
        keyboardType="email-address"
        leftIcon={{ type: 'material', name: 'email', color: theme.colors.primary }}
      />

      <Input
        label="Juiz"
        value={formData.juiz}
        onChangeText={(text) => handleInputChange('juiz', text)}
        placeholder="Nome do juiz"
        leftIcon={{ type: 'material', name: 'gavel', color: theme.colors.primary }}
      />

      <Input
        label="Promotor"
        value={formData.promotor}
        onChangeText={(text) => handleInputChange('promotor', text)}
        placeholder="Nome do promotor"
        leftIcon={{ type: 'material', name: 'record-voice-over', color: theme.colors.primary }}
      />

      <Input
        label="Perito"
        value={formData.perito}
        onChangeText={(text) => handleInputChange('perito', text)}
        placeholder="Nome do perito"
        leftIcon={{ type: 'material', name: 'psychology', color: theme.colors.primary }}
      />
    </View>
  );

  const renderExtraForm = () => (
    <View style={styles.mainForm}>
      <Input
        label="Preposto do Cliente"
        value={formData.prepostoCliente}
        onChangeText={(text) => handleInputChange('prepostoCliente', text)}
        placeholder="Nome do preposto"
        leftIcon={{ type: 'material', name: 'person', color: theme.colors.primary }}
      />

      <Input
        label="Testemunhas"
        value={formData.testemunhas}
        onChangeText={(text) => handleInputChange('testemunhas', text)}
        multiline
        numberOfLines={3}
        placeholder="Lista de testemunhas"
        leftIcon={{ type: 'material', name: 'people', color: theme.colors.primary }}
      />

      <Input
        label="Documentos Necessários"
        value={formData.documentosNecessarios}
        onChangeText={(text) => handleInputChange('documentosNecessarios', text)}
        multiline
        numberOfLines={4}
        placeholder="Liste os documentos necessários para o compromisso"
        leftIcon={{ type: 'material', name: 'assignment', color: theme.colors.primary }}
      />

      <Input
        label="Observações Adicionais"
        value={formData.observacoes}
        onChangeText={(text) => handleInputChange('observacoes', text)}
        multiline
        numberOfLines={4}
        placeholder="Observações importantes"
        leftIcon={{ type: 'material', name: 'note', color: theme.colors.primary }}
      />
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'processo':
        return renderProcessoForm();
      case 'partes':
        return renderPartesForm();
      case 'extra':
        return renderExtraForm();
      default:
        return renderMainForm();
    }
  };

  const renderBottom = () => {
    return (
      <View style={styles.bottomButtonsContainer}>
        <View style={styles.bottomButtons}>
          {editingEvent && (
            <Button
              title="Excluir"
              icon={{ name: 'delete', color: 'white' }}
              buttonStyle={styles.deleteButton}
              onPress={handleDelete}
            />
          )}
          <Button
            title="Salvar"
            icon={{ name: 'save', color: 'white' }}
            buttonStyle={styles.saveButton}
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
          />
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    mainForm: {
      padding: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.colors.textSecondary,
    },
    dateTimeSection: {
      flexDirection: 'column',
      marginHorizontal: 10,
      marginBottom: 20,
      gap: 16,
    },
    dateTimeField: {
      width: '100%',
      backgroundColor: isDarkMode ? theme.colors.surface : '#f5f5f5',
      borderRadius: 8,
      padding: 15,
      minHeight: 60,
    },
    picker: {
      width: '100%',
      height: 50,
      marginTop: 10,
      transform: [{ scale: 0.9 }],
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
      marginTop: 10,
      width: '100%',
      paddingVertical: 10,
    },
    toggleAdvancedButton: {
      backgroundColor: 'transparent',
      marginTop: 10,
    },
    toggleButtonTitle: {
      color: theme.colors.primary,
    },
    bottomButtonsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 10,
      paddingHorizontal: 15,
      paddingBottom: Platform.OS === 'ios' ? 25 : 15,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      zIndex: 100,
    },
    bottomButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: 30,
      paddingVertical: 12,
      flex: 1,
      marginLeft: 5,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      borderRadius: 8,
      paddingHorizontal: 20,
      marginRight: 5,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 15,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    sectionHeader: {
      backgroundColor: isDarkMode ? theme.colors.surface : '#f9f9f9',
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginTop: 10,
      marginBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionHeaderText: {
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderTabs()}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {renderContent()}
      </ScrollView>
      {renderBottom()}
    </KeyboardAvoidingView>
  );
};

export default EventDetailsScreen;
