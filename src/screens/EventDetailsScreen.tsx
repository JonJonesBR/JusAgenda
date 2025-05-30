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
  TouchableOpacity,
  Share, // Added for Share functionality
  ActivityIndicator, // Added for loading state
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';

import { useTheme, Theme } from '../contexts/ThemeContext'; // Added Theme type
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType, EventStatus, Reminder } from '../types/event'; // Added Reminder
import { HomeStackParamList } from '../navigation/stacks/HomeStack';
import {
  formatDate,
  formatTime,
  parseDateString,
  combineDateTime,
  formatDisplayDate, // Added for read-only display
  parseISO, // Added for read-only display
  isDateValid, // Added for read-only display
  formatDateTime, // Added for read-only display
} from '../utils/dateUtils';
import { Input, Header, Button, CustomDateTimePicker, Section } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { 
  ROUTES, 
  EVENT_TYPES, 
  EVENT_TYPE_LABELS, 
  PRIORIDADES, 
  PRIORIDADE_LABELS, 
  EVENT_STATUS_LABELS, 
  REMINDER_OPTIONS, 
  APP_CONFIG,
  getEventTypeLabel, // Added for read-only display
  getEventStatusLabel, // Added for read-only display
} from '../constants';

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
  const readOnlyFromParams = route.params?.readOnly;

  const [isReadOnlyMode, setIsReadOnlyMode] = useState<boolean>(!!readOnlyFromParams);
  const [formData, setFormData] = useState<EventFormData>(getInitialFormData(initialDateStringFromParams));
  const [isEditing, setIsEditing] = useState<boolean>(!!eventIdFromParams);
  const [isLoading, setIsLoading] = useState<boolean>(!!eventIdFromParams);
  const [eventNotFound, setEventNotFound] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  const { addEvent, updateEvent, getEventById, deleteEvent } = useEvents();

  // Helper functions for read-only mode actions, defined within component scope
  const handleEditEvent = () => {
    if (formData.id) {
      navigation.navigate(ROUTES.EVENT_DETAILS, {
        eventId: formData.id,
        readOnly: false,
      });
    } else {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'ID do evento não encontrado para edição.' });
    }
  };

  const handleDeleteEvent = () => {
    if (!formData.id || !formData.title) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não é possível apagar o evento sem ID ou título.' });
      return;
    }
    Alert.alert(
      'Confirmar Exclusão',
      `Tem a certeza que deseja apagar o evento "${formData.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            const success = deleteEvent(formData.id!); 
            if (success) {
              Toast.show({ type: 'success', text1: 'Evento Apagado', text2: `"${formData.title}" foi removido.` });
              navigation.goBack();
            } else {
              Toast.show({ type: 'error', text1: 'Erro ao Apagar', text2: 'Não foi possível apagar o evento.' });
            }
          },
        },
      ]
    );
  };

  const handleShareEvent = async () => {
    if (!formData.title) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Título do evento não disponível para partilha.' });
      return;
    }
    try {
      const eventDateStr = formData.data ? formatDisplayDate(formData.data) : 'N/D';
      const eventTimeStr = formData.isAllDay ? 'Dia Todo' : (formData.hora ? formatTime(formData.hora) : '');

      let message = `Evento: ${formData.title}\n`;
      message += `Data: ${eventDateStr}${eventTimeStr ? ` às ${eventTimeStr}` : ''}\n`;
      if (formData.local) message += `Local: ${formData.local}\n`;
      if (formData.description) message += `Descrição: ${formData.description}\n`;

      const result = await Share.share({
        message,
        title: `Detalhes do Evento: ${formData.title}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Evento partilhado via: ${result.activityType}`);
        } else {
          console.log('Evento partilhado.');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Partilha de evento descartada.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro ao Partilhar', `Não foi possível partilhar o evento: ${errorMessage}`);
    }
  };

  useLayoutEffect(() => {
    let title = '';
    if (isReadOnlyMode) {
      title = formData.title || 'Detalhes do Evento'; // Show event title or generic title in read-only
    } else {
      title = isEditing ? 'Editar Evento' : 'Novo Evento';
    }
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, isEditing, isReadOnlyMode, formData.title]);

  useEffect(() => {
    if (eventIdFromParams) {
      setIsLoading(true); // Start loading when fetching an event
      const eventToLoad = getEventById(eventIdFromParams);
      if (eventToLoad) {
        const dataDate = eventToLoad.data ? parseDateString(eventToLoad.data) : null;
        let horaDate: Date | null = null;
        if (eventToLoad.data && eventToLoad.hora) {
          horaDate = combineDateTime(eventToLoad.data, eventToLoad.hora);
        }

        setFormData({
          id: eventToLoad.id,
          title: eventToLoad.title,
          data: dataDate,
          hora: horaDate,
          isAllDay: eventToLoad.isAllDay || false,
          eventType: eventToLoad.eventType || EVENT_TYPES.REUNIAO,
          local: eventToLoad.local || '',
          description: eventToLoad.description || '',
          numeroProcesso: eventToLoad.numeroProcesso || '',
          vara: eventToLoad.vara || '',
          comarca: eventToLoad.comarca || '',
          prioridade: eventToLoad.prioridade || PRIORIDADES.MEDIA,
          status: eventToLoad.status || 'scheduled',
          cor: eventToLoad.cor || '',
          reminders: eventToLoad.reminders || [...APP_CONFIG.DEFAULT_REMINDER_MINUTES],
        });
        setIsEditing(true); // This means we are in "edit" or "view" mode for an existing event
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Evento não encontrado.' });
        setEventNotFound(true); // Set event not found state
        // navigation.goBack(); // Consider letting render show "Not Found"
      }
      setIsLoading(false); // Stop loading once processed
    } else {
      // New event mode
      setIsEditing(false);
      setIsReadOnlyMode(false); // Cannot be read-only if new
      setIsLoading(false); // Not loading a new event form
      setFormData(getInitialFormData(initialDateStringFromParams));
    }
  }, [eventIdFromParams, getEventById, initialDateStringFromParams, isReadOnlyMode]); // Added isReadOnlyMode

  const handleInputChange = useCallback((field: keyof EventFormData, value: any) => {
    // Prevent changes if in read-only mode, though inputs should be disabled/text
    if (isReadOnlyMode) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors, isReadOnlyMode]);

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

  // Loading state for existing event
  if (isLoading && eventIdFromParams && !eventNotFound) {
    return (
      <View style={[styles.centeredMessageContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.messageText, { color: theme.colors.text }]}>Carregando evento...</Text>
      </View>
    );
  }

  // Event not found state
  if (eventNotFound) {
    return (
      <View style={[styles.centeredMessageContainer, { backgroundColor: theme.colors.background }]}>
         <Header title="Erro" onBackPress={() => navigation.goBack()} />
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={[styles.messageText, { color: theme.colors.text }]}>
          Evento não encontrado.
        </Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} type="outline" />
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
        // Title is now set in useLayoutEffect
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="Informações Básicas" theme={theme} style={styles.sectionSpacing}>
          {isReadOnlyMode ? (
            <>
              <DetailItemView label="Título" value={formData.title} theme={theme} iconName="format-title" fullWidthValue />
              <DetailItemView label="Tipo" value={getEventTypeLabel(formData.eventType)} theme={theme} iconName="tag-outline" />
              <DetailItemView
                label="Data"
                value={formData.data ? formatDisplayDate(formData.data) : 'N/D'}
                theme={theme}
                iconName="calendar"
              />
              {!formData.isAllDay && formData.hora && (
                <DetailItemView
                  label="Hora"
                  value={formatTime(formData.hora)}
                  theme={theme}
                  iconName="clock-outline"
                />
              )}
              <DetailItemView label="Dia Todo" value={formData.isAllDay} theme={theme} iconName="calendar-check" />
              <DetailItemView label="Local" value={formData.local} theme={theme} iconName="map-marker-outline" fullWidthValue />
              <DetailItemView label="Cor" value={formData.cor} theme={theme} iconName="palette-outline" />
            </>
          ) : (
            <>
              <Input
                label="Título *"
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                error={errors.title}
                placeholder="Ex: Reunião de alinhamento"
                editable={!isReadOnlyMode}
              />
              <Text style={[styles.label, { color: theme.colors.placeholder }]}>Tipo de Evento *</Text>
              <View style={pickerContainerStyle(!!errors.eventType)}>
                <Picker
                  selectedValue={formData.eventType}
                  onValueChange={(itemValue) => handleInputChange('eventType', itemValue as string)}
                  style={pickerStyle}
                  dropdownIconColor={theme.colors.placeholder}
                  enabled={!isReadOnlyMode}
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
                    disabled={isReadOnlyMode}
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
                      disabled={formData.isAllDay || isReadOnlyMode}
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
                  disabled={isReadOnlyMode}
                />
              </View>

              <Input
                label="Local"
                value={formData.local || ''}
                onChangeText={(text) => handleInputChange('local', text)}
                error={errors.local}
                placeholder="Ex: Escritório, Online"
                editable={!isReadOnlyMode}
              />
              <Input
                label="Cor (Hex)"
                value={formData.cor || ''}
                onChangeText={(text) => handleInputChange('cor', text)}
                error={errors.cor}
                placeholder="#RRGGBB"
                autoCapitalize="none"
                editable={!isReadOnlyMode}
              />
            </>
          )}
        </Section>

        <Section title="Detalhes Adicionais" theme={theme} style={styles.sectionSpacing}>
          {isReadOnlyMode ? (
            <>
              <DetailItemView label="Nº Processo" value={formData.numeroProcesso} theme={theme} iconName="gavel" />
              <DetailItemView label="Vara/Comarca" value={formData.vara} theme={theme} iconName="bank-outline" />
              {/* <DetailItemView label="Comarca" value={formData.comarca} theme={theme} iconName="map-legend" /> */}
              <DetailItemView label="Prioridade" value={formData.prioridade ? PRIORIDADE_LABELS[formData.prioridade] : undefined} theme={theme} iconName="priority-high" />
              <DetailItemView label="Status" value={formData.status ? getEventStatusLabel(formData.status) : undefined} theme={theme} iconName="list-status" />
            </>
          ) : (
            <>
              <Input
                label="Número do Processo"
                value={formData.numeroProcesso || ''}
                onChangeText={(text) => handleInputChange('numeroProcesso', text)}
                error={errors.numeroProcesso}
                keyboardType="numeric"
                editable={!isReadOnlyMode}
              />
              <Input
                label="Vara / Comarca"
                value={formData.vara || ''}
                onChangeText={(text) => handleInputChange('vara', text)}
                error={errors.vara || errors.comarca}
                placeholder="Ex: 1ª Vara Cível de Curitiba"
                editable={!isReadOnlyMode}
              />
              <Text style={[styles.label, { color: theme.colors.placeholder }]}>Prioridade</Text>
              <View style={pickerContainerStyle(!!errors.prioridade)}>
                <Picker
                  selectedValue={formData.prioridade}
                  onValueChange={(itemValue) => handleInputChange('prioridade', itemValue as EventType['prioridade'])}
                  style={pickerStyle}
                  dropdownIconColor={theme.colors.placeholder}
                  enabled={!isReadOnlyMode}
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
                  enabled={!isReadOnlyMode}
                >
                  {Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => (
                    <Picker.Item key={key} label={label} value={key as EventStatus} />
                  ))}
                </Picker>
              </View>
              {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
            </>
          )}
        </Section>

        <Section title="Lembretes" theme={theme} style={styles.sectionSpacing}>
          {isReadOnlyMode ? (
            <DetailItemView label="Lembretes" value={formatDisplayReminders(formData.reminders)} theme={theme} iconName="bell-ring-outline" fullWidthValue />
          ) : (
            <>
              <Text style={[styles.label, { color: theme.colors.placeholder, marginBottom: theme.spacing.sm }]}>
                Selecione os lembretes (minutos antes do evento):
              </Text>
              {REMINDER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.reminderOptionRow}
                  onPress={() => {
                    if (isReadOnlyMode) return;
                    const currentReminders = formData.reminders || [];
                    const newReminders = currentReminders.includes(option.value)
                      ? currentReminders.filter(r => r !== option.value)
                      : [...currentReminders, option.value];
                    handleInputChange('reminders', newReminders.sort((a, b) => a - b));
                  }}
                  disabled={isReadOnlyMode}
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
            </>
          )}
        </Section>

        <Section title="Descrição / Observações" theme={theme} style={styles.sectionSpacing}>
          {isReadOnlyMode ? (
            <DetailItemView label="Descrição" value={formData.description} theme={theme} iconName="text-long" fullWidthValue />
          ) : (
            <Input
              label="Descrição Detalhada"
              value={formData.description || ''}
              onChangeText={(text) => handleInputChange('description', text)}
              error={errors.description}
              multiline
              numberOfLines={4}
              inputStyle={{ height: 100, textAlignVertical: 'top' }}
              placeholder="Detalhes, pauta, links importantes..."
              editable={!isReadOnlyMode}
            />
          )}
        </Section>

        {!isReadOnlyMode && (
          <Button
            title={isEditing ? 'Salvar Alterações' : 'Criar Evento'}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            type="solid"
            buttonStyle={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}
          />
        )}
        {/* Read-only action buttons */}
        {isReadOnlyMode && eventIdFromParams && (
          <View style={styles.readOnlyActionsContainer}>
            <Button
              title="Editar"
              onPress={handleEditEvent}
              type="solid"
              icon="pencil-outline"
              buttonStyle={styles.readOnlyButton}
            />
            <Button
              title="Partilhar"
              onPress={handleShareEvent}
              type="outline"
              icon="share-variant-outline"
              buttonStyle={styles.readOnlyButton}
            />
            <Button
              title="Apagar"
              onPress={handleDeleteEvent}
              type="outline"
              icon="delete-outline"
              buttonStyle={styles.readOnlyButton}
              titleStyle={{ color: theme.colors.error }}
              iconColor={theme.colors.error}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Componente auxiliar para renderizar cada item de detalhe (copiado de EventViewScreen)
const DetailItemView: React.FC<{
  label: string;
  value?: string | number | boolean | React.ReactNode;
  theme: Theme;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  fullWidthValue?: boolean;
  valueStyle?: object;
}> = ({ label, value, theme, iconName, fullWidthValue = false, valueStyle }) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  let displayValue: React.ReactNode;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Sim' : 'Não';
  } else {
    displayValue = value;
  }

  return (
    <View style={styles.detailItemContainer}>
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={18}
          color={theme.colors.primary}
          style={styles.detailItemIcon}
        />
      )}
      <Text style={[styles.detailLabelFixed, { color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.regular }]}>
        {label}:
      </Text>
      <View style={fullWidthValue ? styles.detailValueFullWidth : styles.detailValue}>
        {typeof displayValue === 'string' || typeof displayValue === 'number' ? (
          <Text style={[styles.detailValueText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }, valueStyle]}>
            {displayValue}
          </Text>
        ) : (
          displayValue
        )}
      </View>
    </View>
  );
};


const formatDisplayReminders = (reminders?: Reminder[]): string => {
  if (!reminders || reminders.length === 0) return 'Nenhum';
  return reminders
    .map(rValue => REMINDER_OPTIONS.find(opt => opt.value === rValue)?.label || `${rValue} min`)
    .join('; ');
};

const styles = StyleSheet.create({
  centeredMessageContainer: { // Renomeado de loadingContainer para ser mais genérico
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
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
    // color: theme.colors.placeholder, // Aplicado diretamente no componente Text
  },
  detailLabelFixed: { // Estilo para DetailItemView, similar ao label mas com nome diferente para evitar conflitos
    fontSize: 14,
    marginRight: 6,
    minWidth: 100, // Garante alinhamento dos valores
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
  // Estilos para DetailItemView (copiados e adaptados de EventViewScreen)
  detailItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: theme.colors.border, // Seria bom ter acesso ao theme aqui
  },
  detailItemIcon: {
    marginRight: 10,
    marginTop: Platform.OS === 'ios' ? 1 : 3,
  },
  detailValue: {
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  detailValueFullWidth: {
    flex: 1,
    alignItems: 'flex-start',
  },
  detailValueText: {
    fontSize: 14,
    textAlign: 'left',
  },
  readOnlyActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: theme.colors.border, // Seria bom ter acesso ao theme aqui
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 20 : 8, // Espaço extra para notch no iOS
  },
  readOnlyButton: {
    flex: 1,
    marginHorizontal: 4,
  }
});

export default EventDetailsScreen;
