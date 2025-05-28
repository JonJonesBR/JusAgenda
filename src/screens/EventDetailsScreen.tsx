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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';

import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType, EventStatus } from '../types/event';
import { HomeStackParamList } from '../navigation/stacks/HomeStack'; // Ajuste para a sua Stack Param List correta
import {
  formatDate,
  formatTime,
  parseDateString,
  combineDateTime,
  ensureDateObject,
} from '../utils/dateUtils';
import { Input, Header, Button, CustomDateTimePicker, Section } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES, EVENT_TYPES, EVENT_TYPE_LABELS, PRIORIDADES, PRIORIDADE_LABELS, EVENT_STATUS_LABELS } from '../constants';

// Tipagem para os parâmetros da rota
type EventDetailsScreenRouteProp = RouteProp<HomeStackParamList, typeof ROUTES.EVENT_DETAILS>;
// Tipagem para a prop de navegação
type EventDetailsScreenNavigationProp = StackNavigationProp<HomeStackParamList, typeof ROUTES.EVENT_DETAILS>;

// Interface para os dados do formulário (usando Date para date pickers)
interface EventFormData {
  id?: string;
  title: string;
  data: Date | null; // Data como objeto Date
  hora: Date | null; // Hora como objeto Date
  isAllDay: boolean;
  eventType: string; // Usar EventTypeValue se definido em constants
  local?: string;
  description?: string;
  numeroProcesso?: string;
  vara?: string;
  comarca?: string;
  prioridade?: EventType['prioridade'];
  status?: EventStatus;
  cor?: string;
  // Adicione outros campos conforme necessário
}

// Valores iniciais para um novo evento
const getInitialFormData = (initialDateString?: string): EventFormData => {
  let initialDate = new Date();
  if (initialDateString) {
    const parsedInitialDate = parseDateString(initialDateString);
    if (parsedInitialDate) {
      initialDate = parsedInitialDate;
    }
  }
  // Define a hora inicial para o início da próxima hora cheia, ou null
  const initialTime = new Date(initialDate);
  initialTime.setHours(initialDate.getHours() + 1, 0, 0, 0);


  return {
    title: '',
    data: initialDate,
    hora: null, // Começa sem hora definida, a menos que queira um padrão
    isAllDay: false,
    eventType: EVENT_TYPES.REUNIAO, // Tipo padrão
    local: '',
    description: '',
    numeroProcesso: '',
    vara: '',
    comarca: '',
    prioridade: PRIORIDADES.MEDIA,
    status: 'scheduled',
    cor: '',
  };
};

// Esquema de validação Yup (deve corresponder à estrutura de EventType após conversão)
const eventValidationSchema = Yup.object().shape({
  title: Yup.string().required('O título é obrigatório.').min(3, 'Mínimo 3 caracteres.'),
  // 'data' e 'hora' no schema validam as strings formatadas, não os objetos Date do formulário
  data: Yup.string().required('A data é obrigatória.').matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido.'),
  hora: Yup.string().nullable().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido.').optional(),
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
});


const EventDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { addEvent, updateEvent, getEventById } = useEvents();
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const route = useRoute<EventDetailsScreenRouteProp>();

  const eventIdFromParams = route.params?.eventId;
  const initialDateStringFromParams = route.params?.initialDateString; // YYYY-MM-DD

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
        // Converte data e hora (strings) para objetos Date para o formulário
        const dataDate = eventToEdit.data ? parseDateString(eventToEdit.data) : null;
        let horaDate: Date | null = null;
        if (eventToEdit.data && eventToEdit.hora) {
          horaDate = combineDateTime(eventToEdit.data, eventToEdit.hora);
        } else if (dataDate && !eventToEdit.hora && !eventToEdit.isAllDay) {
            // Se tem data, não tem hora e não é dia todo, podemos inicializar a hora
            // horaDate = new Date(dataDate); // Hora será 00:00 ou pode pegar hora atual
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
        });
        setIsEditing(true);
        setIsLoading(false);
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Evento não encontrado.' });
        navigation.goBack();
      }
    } else {
      // Novo evento, data inicial já definida por getInitialFormData
      setIsEditing(false);
    }
  }, [eventIdFromParams, getEventById, navigation, initialDateStringFromParams]);

  const handleInputChange = useCallback((field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleDateChange = (event: CustomDateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      handleInputChange('data', selectedDate);
      if (formData.isAllDay) {
        handleInputChange('hora', null); // Limpa a hora se for dia todo
      }
    }
  };

  const handleTimeChange = (event: CustomDateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === 'set' && selectedTime) {
      handleInputChange('hora', selectedTime);
    }
  };

  const handleIsAllDayChange = (value: boolean) => {
    handleInputChange('isAllDay', value);
    if (value) {
      handleInputChange('hora', null); // Limpa a hora se for dia todo
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    // Prepara os dados para validação e submissão (converte Date para string)
    const dataToValidateAndSubmit: Partial<EventType> = {
      ...formData,
      id: formData.id, // Mantém o ID se estiver editando
      data: formData.data ? formatDate(formData.data, 'yyyy-MM-dd') : '', // String YYYY-MM-DD
      hora: !formData.isAllDay && formData.hora ? formatTime(formData.hora) : undefined, // String HH:MM ou undefined
      // Garante que campos opcionais não definidos sejam undefined
      local: formData.local?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      numeroProcesso: formData.numeroProcesso?.trim() || undefined,
      vara: formData.vara?.trim() || undefined,
      comarca: formData.comarca?.trim() || undefined,
      cor: formData.cor?.trim() || undefined,
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

  if (isLoading && eventIdFromParams) { // Mostra loading apenas se estiver carregando um evento para edição
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: theme.spacing.md }}>Carregando evento...</Text>
      </View>
    );
  }

  // Estilos para Pickers
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // 'height' pode ser problemático com ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (64 + theme.spacing.md) : 0} // Ajuste conforme o seu Header
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
                  value={formData.hora || new Date()} // Passa new Date() se hora for null para o picker
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  disabled={formData.isAllDay}
                />
                {errors.hora && <Text style={styles.errorText}>{errors.hora}</Text>}
              </View>
            )}
          </View>
           {/* Espaçamento após a linha de data/hora e antes do switch "Dia todo" */}
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
            value={formData.vara || ''} // Pode dividir em dois campos se preferir
            onChangeText={(text) => handleInputChange('vara', text)} // Assumindo que 'vara' pode conter comarca
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


          <Input
            label="Descrição / Observações"
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
    paddingHorizontal: 16, // Usar theme.spacing.md
    paddingBottom: 30, // Espaço para o botão Salvar não ficar colado na borda
  },
  sectionSpacing: {
    marginBottom: 12, // Usar theme.spacing.md ou lg
  },
  label: {
    fontSize: 14, // Usar theme.typography.fontSize.sm
    // color: theme.colors.placeholder, // Definido inline
    marginBottom: 6, // Usar theme.spacing.xs
    // fontFamily: theme.typography.fontFamily.regular, // Definido inline
  },
  errorText: {
    fontSize: 12, // Usar theme.typography.fontSize.xs
    color: 'red', // Definido via theme.colors.error inline
    marginTop: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Para alinhar labels e inputs corretamente
    // marginBottom: 16, // Espaçamento gerenciado pelos inputs ou View abaixo
  },
  flexInput: {
    flex: 1,
    // Adicionar marginRight ou marginLeft para espaçamento entre inputs na mesma linha
    // Ex: se este for o input da esquerda: { marginRight: theme.spacing.sm }
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12, // Usar theme.spacing.sm ou md
  },
  // Estilos para Pickers são aplicados inline através da função pickerContainerStyle
});

export default EventDetailsScreen;
