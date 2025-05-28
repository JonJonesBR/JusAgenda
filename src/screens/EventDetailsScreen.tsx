// src/screens/EventDetailsScreen.tsx
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  Switch,
  TouchableOpacity, // Added for reminder toggles
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Added for reminder icons
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';

import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType, EventStatus } from '../types/event';
import { HomeStackParamList } from '../navigation/stacks/HomeStack';
import {
  formatDate,
  formatTime,
  parseDateString,
  combineDateTime,
} from '../utils/dateUtils';
import { Input, Header, Button, CustomDateTimePicker, Section } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES, EVENT_TYPES, EVENT_TYPE_LABELS, PRIORIDADES, PRIORIDADE_LABELS, EVENT_STATUS_LABELS, REMINDER_OPTIONS, APP_CONFIG } from '../constants';

type EventDetailsScreenRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.EVENT_DETAILS>;
type EventDetailsScreenNavigationProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.EVENT_DETAILS>;

interface EventFormData {
  id?: string;
  title: string;
  data: Date | null;
  hora: Date | null;
  isAllDay: boolean;
  eventType: string;
  local?: string;
  description?: string;
  numeroProcesso?: string;
  vara?: string;
  comarca?: string;
  prioridade?: EventType['prioridade'];
  status?: EventStatus;
  cor?: string;
  reminders?: number[]; // Array of minutes
}

const getInitialFormData = (initialDateString?: string): EventFormData => {
  let initialDate = new Date();
  if (initialDateString) {
    const parsedInitialDate = parseDateString(initialDateString);
    if (parsedInitialDate) {
      initialDate = parsedInitialDate;
    }
  }
  // const initialTime = new Date(initialDate);
  // initialTime.setHours(initialDate.getHours() + 1, 0, 0, 0);

  return {
    title: '',
    data: initialDate,
    hora: null,
    isAllDay: false,
    eventType: EVENT_TYPES.REUNIAO,
    local: '',
    description: '',
    numeroProcesso: '',
    vara: '',
    comarca: '',
    prioridade: PRIORIDADES.MEDIA,
    status: 'scheduled',
    cor: '',
    reminders: [...APP_CONFIG.DEFAULT_REMINDER_MINUTES], // Default reminders
  };
};

const eventValidationSchema = Yup.object().shape({
  title: Yup.string().required('O título é obrigatório.').min(3, 'Mínimo 3 caracteres.'),
  data: Yup.string().required('A data é obrigatória.').matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido.'),
  hora: Yup.string().nullable().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido.').when('isAllDay', {
    is: false,
    otherwise: schema => schema.optional().nullable(),
  }),
  isAllDay: Yup.boolean().required(),
  eventType: Yup.string().required('O tipo de evento é obrigatório.'),
  local: Yup.string().optional().nullable(),
  description: Yup.string().optional().nullable(),
  numeroProcesso: Yup.string().optional().nullable(),
  vara: Yup.string().optional().nullable(),
  comarca: Yup.string().optional().nullable(),
  prioridade: Yup.string().oneOf(Object.values(PRIORIDADES)).optional().nullable(),
  status: Yup.string<EventStatus>().required('O status é obrigatório.'),
  cor: Yup.string().optional().nullable().matches(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Cor hexadecimal inválida (ex: #RRGGBB).'),
  reminders: Yup.array().of(Yup.number().integer().min(0)).optional().nullable(),
});

const EventDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { addEvent, updateEvent, getEventById } = useEvents();
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();

  const eventIdFromParams = route.params?.eventId;
  const initialDateStringFromParams = route.params?.initialDateString;

  const [formData, setFormData] = useState<EventFormData>(getInitialFormData(initialDateStringFromParams));
  const [isEditing, setIsEditing] = useState<boolean>(!!eventIdFromParams);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? 'Editar Evento' : 'Novo Evento',
    });
  }, [navigation, isEditing]);

  useEffect(() => {
    if (eventIdFromParams) {
      const eventToEdit = getEventById(eventIdFromParams);
      if (eventToEdit) {
        setIsLoading(true);
        const dataDate = eventToEdit.data ? parseDateString(eventToEdit.data) : null;
        let horaDate: Date | null = null;
        if (eventToEdit.data && eventToEdit.hora) {
          horaDate = combineDateTime(eventToEdit.data, eventToEdit.hora);
        }

        setFormData({
          id: eventToEdit.id,
          title: eventToEdit.title,
          data: dataDate,
          hora: horaDate,
          isAllDay: eventToEdit.isAllDay || false,
          eventType: eventToEdit.eventType || EVENT_TYPES.REUNIAO,
          local: eventToEdit.local || '',
          description: eventToEdit.description || '',
          numeroProcesso: eventToEdit.numeroProcesso || '',
          vara: eventToEdit.vara || '',
          comarca: eventToEdit.comarca || '',
          prioridade: eventToEdit.prioridade || PRIORIDADES.MEDIA,
          status: eventToEdit.status || 'scheduled',
          cor: eventToEdit.cor || '',
          reminders: eventToEdit.reminders || [...APP_CONFIG.DEFAULT_REMINDER_MINUTES],
        });
        setIsEditing(true);
        setIsLoading(false);
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Evento não encontrado.' });
        navigation.goBack();
      }
    } else {
      setIsEditing(false);
    }
  }, [eventIdFromParams, getEventById, navigation, initialDateStringFromParams]);

  const handleInputChange = useCallback((field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleDateChange = (event: any, selectedDate?: Date) => { // CustomDateTimePickerEvent type was causing issues
    if (event.type === 'set' && selectedDate) {
      handleInputChange('data', selectedDate);
      if (formData.isAllDay) {
        handleInputChange('hora', null);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => { // CustomDateTimePickerEvent type was causing issues
    if (event.type === 'set' && selectedTime) {
      handleInputChange('hora', selectedTime);
    }
  };

  const handleIsAllDayChange = (value: boolean) => {
    handleInputChange('isAllDay', value);
    if (value) {
      handleInputChange('hora', null);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    const dataToValidateAndSubmit: Partial<EventType> = {
      ...formData,
      id: formData.id,
      data: formData.data ? formatDate(formData.data, 'yyyy-MM-dd') : '',
      hora: !formData.isAllDay && formData.hora ? formatTime(formData.hora) : undefined,
      local: formData.local?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      numeroProcesso: formData.numeroProcesso?.trim() || undefined,
      vara: formData.vara?.trim() || undefined,
      comarca: formData.comarca?.trim() || undefined,
      cor: formData.cor?.trim() || undefined,
      reminders: formData.reminders,
    };

    try {
      await eventValidationSchema.validate(dataToValidateAndSubmit, { abortEarly: false });
      const eventPayload = dataToValidateAndSubmit as Omit<EventType, 'id'> | EventType;

      if (isEditing && formData.id) {
        await updateEvent(eventPayload as EventType);
        Toast.show({ type: 'success', text1: 'Evento Atualizado', text2: `"${formData.title}" foi atualizado.` });
      } else {
        await addEvent(eventPayload as Omit<EventType, 'id'>);
        Toast.show({ type: 'success', text1: 'Evento Criado', text2: `"${formData.title}" foi adicionado.` });
      }
      navigation.goBack();
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const yupErrors: Partial<Record<keyof EventFormData, string>> = {};
        err.inner.forEach(error => {
          if (error.path && !yupErrors[error.path as keyof EventFormData]) {
            yupErrors[error.path as keyof EventFormData] = error.message;
          }
        });
        setErrors(yupErrors);
        Toast.show({ type: 'error', text1: 'Campos Inválidos', text2: 'Por favor, corrija os erros.' });
      } else {
        console.error('Erro ao salvar evento:', err);
        Toast.show({ type: 'error', text1: 'Erro ao Salvar', text2: 'Não foi possível salvar o evento.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && eventIdFromParams) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: theme.spacing.md }}>Carregando evento...</Text>
      </View>
    );
  }

  const pickerContainerStyle = (hasError?: boolean) => ({
    borderColor: hasError ? theme.colors.error : theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    marginBottom: hasError ? 0 : theme.spacing.md,
    minHeight: Platform.OS === 'ios' ? undefined : 50,
    justifyContent: 'center',
  });

  const pickerStyle = {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (64 + theme.spacing.md) : 0}
    >
      <Header
        title={isEditing ? 'Editar Evento' : 'Novo Evento'}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="Informações Básicas" theme={theme} style={styles.sectionSpacing}>
          <Input
            label="Título *"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            error={errors.title}
            placeholder="Ex: Reunião de alinhamento"
          />
          <Text style={[styles.label, { color: theme.colors.placeholder }]}>Tipo de Evento *</Text>
          <View style={pickerContainerStyle(!!errors.eventType)}>
            <Picker
              selectedValue={formData.eventType}
              onValueChange={(itemValue) => handleInputChange('eventType', itemValue as string)}
              style={pickerStyle}
              dropdownIconColor={theme.colors.placeholder}
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key} />
              ))}
            </Picker>
          </View>
          {errors.eventType && <Text style={styles.errorText}>{errors.eventType}</Text>}

          <View style={styles.row}>
            <View style={styles.flexInput}>
              <Text style={[styles.label, { color: theme.colors.placeholder }]}>Data *</Text>
              <CustomDateTimePicker
                value={formData.data || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                onChange={handleDateChange}
              />
              {errors.data && <Text style={styles.errorText}>{errors.data}</Text>}
            </View>
            {!formData.isAllDay && (
              <View style={styles.flexInput}>
                <Text style={[styles.label, { color: theme.colors.placeholder }]}>Hora</Text>
                <CustomDateTimePicker
                  value={formData.hora || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  disabled={formData.isAllDay}
                />
                {errors.hora && <Text style={styles.errorText}>{errors.hora}</Text>}
              </View>
            )}
          </View>
          <View style={{ marginBottom: (errors.data || errors.hora) ? 0 : theme.spacing.md }} />

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.colors.text, flex: 1 }]}>Dia Todo?</Text>
            <Switch
              trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
              ios_backgroundColor={theme.colors.disabled}
              onValueChange={handleIsAllDayChange}
              value={formData.isAllDay}
            />
          </View>

          <Input
            label="Local"
            value={formData.local || ''}
            onChangeText={(text) => handleInputChange('local', text)}
            error={errors.local}
            placeholder="Ex: Escritório, Online"
          />
          <Input
            label="Cor (Hex)"
            value={formData.cor || ''}
            onChangeText={(text) => handleInputChange('cor', text)}
            error={errors.cor}
            placeholder="#RRGGBB"
            autoCapitalize="none"
          />
        </Section>

        <Section title="Detalhes Adicionais" theme={theme} style={styles.sectionSpacing}>
          <Input
            label="Número do Processo"
            value={formData.numeroProcesso || ''}
            onChangeText={(text) => handleInputChange('numeroProcesso', text)}
            error={errors.numeroProcesso}
            keyboardType="numeric"
          />
          <Input
            label="Vara / Comarca"
            value={formData.vara || ''}
            onChangeText={(text) => handleInputChange('vara', text)}
            error={errors.vara || errors.comarca}
            placeholder="Ex: 1ª Vara Cível de Curitiba"
          />
          <Text style={[styles.label, { color: theme.colors.placeholder }]}>Prioridade</Text>
           <View style={pickerContainerStyle(!!errors.prioridade)}>
            <Picker
              selectedValue={formData.prioridade}
              onValueChange={(itemValue) => handleInputChange('prioridade', itemValue as EventType['prioridade'])}
              style={pickerStyle}
              dropdownIconColor={theme.colors.placeholder}
            >
              {Object.entries(PRIORIDADE_LABELS).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key} />
              ))}
            </Picker>
          </View>
          {errors.prioridade && <Text style={styles.errorText}>{errors.prioridade}</Text>}

          <Text style={[styles.label, { color: theme.colors.placeholder, marginTop: theme.spacing.md }]}>Status do Evento *</Text>
           <View style={pickerContainerStyle(!!errors.status)}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(itemValue) => handleInputChange('status', itemValue as EventStatus)}
              style={pickerStyle}
              dropdownIconColor={theme.colors.placeholder}
            >
              {Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key as EventStatus} />
              ))}
            </Picker>
          </View>
          {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
        </Section>

        <Section title="Lembretes" theme={theme} style={styles.sectionSpacing}>
          <Text style={[styles.label, { color: theme.colors.placeholder, marginBottom: theme.spacing.sm }]}>
            Selecione os lembretes (minutos antes do evento):
          </Text>
          {REMINDER_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.value}
              style={styles.reminderOptionRow}
              onPress={() => {
                const currentReminders = formData.reminders || [];
                const newReminders = currentReminders.includes(option.value)
                  ? currentReminders.filter(r => r !== option.value)
                  : [...currentReminders, option.value];
                handleInputChange('reminders', newReminders.sort((a, b) => a - b));
              }}
            >
              <MaterialCommunityIcons
                name={formData.reminders?.includes(option.value) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={formData.reminders?.includes(option.value) ? theme.colors.primary : theme.colors.placeholder}
              />
              <Text style={[styles.reminderLabel, { color: theme.colors.text, marginLeft: theme.spacing.sm }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          {errors.reminders && <Text style={styles.errorText}>{errors.reminders}</Text>}
        </Section>

        <Section title="Descrição / Observações" theme={theme} style={styles.sectionSpacing}>
          <Input
            label="Descrição Detalhada" // Changed label from "Descrição / Observações"
            value={formData.description || ''}
            onChangeText={(text) => handleInputChange('description', text)}
            error={errors.description}
            multiline
            numberOfLines={4}
            inputStyle={{ height: 100, textAlignVertical: 'top' }}
            placeholder="Detalhes, pauta, links importantes..."
          />
        </Section>

        <Button
          title={isEditing ? 'Salvar Alterações' : 'Criar Evento'}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          type="solid"
          buttonStyle={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionSpacing: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flexInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  reminderOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reminderLabel: {
    fontSize: 16,
  },
});

export default EventDetailsScreen;
