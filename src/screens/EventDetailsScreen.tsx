import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform, Text } from 'react-native';
import { Input, Button, Card } from '@rneui/themed';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as yup from 'yup';
import { useEvents } from '../contexts/EventCrudContext';
import { Event as EventType } from '../types/event'; // Importando EventType de src/types/event
import CustomDateTimePicker, { CustomDateTimePickerEvent } from '../components/CustomDateTimePicker';
import { useTheme } from '../contexts/ThemeContext';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { format, parse, isValid as isDateValid, parseISO } from 'date-fns';
import { formatDate as formatDateUtil, formatDateTime as formatDateTimeUtil } from '../utils/dateUtils';

type EventStackParamList = {
  EventList: undefined;
  EventDetails: { eventId?: string; date?: string; event?: Partial<EventType> };
};
type EventDetailsNavigationProp = NativeStackNavigationProp<EventStackParamList, 'EventDetails'>;
type EventDetailsRouteProp = RouteProp<EventStackParamList, 'EventDetails'>;

interface EventFormData {
  id?: string;
  title: string;
  data: Date | null;
  hora: Date | null;
  local?: string;
  descricao?: string;
  tipo?: string;
  processo?: string;
  vara?: string;
  comarca?: string;
  clienteEnvolvido?: string;
  advogadoResponsavel?: string;
  status?: EventType['status']; // Usando o tipo de src/types/event
  lembretes?: number[];
  recorrencia?: EventType['recorrencia']; // Usando o tipo de src/types/event
  contatos?: EventType['contatos'];
}

const eventSchema = yup.object().shape({
  title: yup.string().required('O título do evento é obrigatório.'),
  data: yup.date().nullable().required('A data do evento é obrigatória.').typeError('Data inválida.'),
  hora: yup.date().nullable().required('A hora do evento é obrigatória.').typeError('Hora inválida.'),
  local: yup.string().optional().nullable(),
  descricao: yup.string().optional().nullable(),
  tipo: yup.string().optional().nullable(),
  processo: yup.string().optional().nullable(),
  vara: yup.string().optional().nullable(),
  comarca: yup.string().optional().nullable(),
  clienteEnvolvido: yup.string().optional().nullable(),
  advogadoResponsavel: yup.string().optional().nullable(),
  status: yup.string().optional().nullable(),
  lembretes: yup.array().of(yup.number().required()).optional().nullable(), // Garante que é array de números
  recorrencia: yup.string().optional().nullable(),
});

const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const route = useRoute<EventDetailsRouteProp>();
  const { addEvent, updateEvent, getEventById } = useEvents();
  const { theme } = useTheme();

  const eventIdFromParams = route.params?.eventId;
  const eventFromParams = route.params?.event;
  const initialDateStringFromParams = route.params?.date;

  const [formData, setFormData] = useState<EventFormData>({
    id: undefined,
    title: '',
    data: initialDateStringFromParams ? parse(initialDateStringFromParams, 'yyyy-MM-dd', new Date()) : new Date(),
    hora: new Date(),
    local: '',
    descricao: '',
    tipo: 'geral',
    processo: '',
    vara: '',
    comarca: '',
    clienteEnvolvido: '',
    advogadoResponsavel: '',
    status: 'agendado',
    lembretes: [],
    recorrencia: 'nao_repete',
    contatos: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  useEffect(() => {
    let eventToEdit: EventType | Partial<EventType> | undefined = undefined;
    if (eventIdFromParams) {
        eventToEdit = getEventById(eventIdFromParams);
    } else if (eventFromParams) {
        eventToEdit = eventFromParams;
    }

    if (eventToEdit) {
      let eventDateObj = new Date();
      let eventTimeObj = new Date();

      if (eventToEdit.data && typeof eventToEdit.data === 'string') {
        const parsedDatePart = parseISO(eventToEdit.data);
        if (isDateValid(parsedDatePart)) {
          eventDateObj = parsedDatePart;
          if (eventToEdit.hora && typeof eventToEdit.hora === 'string') {
            const [h, m] = eventToEdit.hora.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
              eventTimeObj = new Date(parsedDatePart);
              eventTimeObj.setHours(h, m, 0, 0);
            } else {
                eventTimeObj = new Date(parsedDatePart);
                eventTimeObj.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
            }
          } else {
            eventTimeObj = new Date(parsedDatePart);
            eventTimeObj.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
          }
        }
      }

      setFormData({
        id: eventToEdit.id,
        title: eventToEdit.title || '',
        data: eventDateObj,
        hora: eventTimeObj,
        local: eventToEdit.local || '',
        descricao: eventToEdit.descricao || '',
        tipo: eventToEdit.tipo || 'geral',
        processo: eventToEdit.processo || '', // Acessando corretamente
        vara: eventToEdit.vara || '',
        comarca: eventToEdit.comarca || '',
        clienteEnvolvido: eventToEdit.clienteEnvolvido || '',
        advogadoResponsavel: eventToEdit.advogadoResponsavel || '',
        status: eventToEdit.status || 'agendado',
        lembretes: Array.isArray(eventToEdit.lembretes) ? eventToEdit.lembretes.map(Number) : [],
        recorrencia: eventToEdit.recorrencia || 'nao_repete',
        contatos: eventToEdit.contatos || [],
      });
    } else if (initialDateStringFromParams) {
        const parsedInitialDate = parse(initialDateStringFromParams, 'yyyy-MM-dd', new Date());
        if (isDateValid(parsedInitialDate)) {
            setFormData(prev => ({
                ...prev,
                data: parsedInitialDate,
                hora: new Date(),
            }));
        }
    }
  }, [eventIdFromParams, eventFromParams, initialDateStringFromParams, getEventById]);

  const handleChange = (name: keyof EventFormData, value: string | Date | null | number[] | EventType['contatos']) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (event: CustomDateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      handleChange('data', selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event: CustomDateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === "set" && selectedTime) {
      handleChange('hora', selectedTime);
    }
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    try {
      await eventSchema.validate(formData, { abortEarly: false });
      setErrors({});

      const eventDataForContext: EventType = {
        id: formData.id || Date.now().toString(),
        title: formData.title,
        data: formData.data ? format(formData.data, 'yyyy-MM-dd') : '',
        hora: formData.hora ? format(formData.hora, 'HH:mm') : '',
        local: formData.local,
        descricao: formData.descricao,
        tipo: formData.tipo,
        processo: formData.processo,
        vara: formData.vara,
        comarca: formData.comarca,
        clienteEnvolvido: formData.clienteEnvolvido,
        advogadoResponsavel: formData.advogadoResponsavel,
        status: formData.status,
        lembretes: formData.lembretes, // Agora é number[]
        recorrencia: formData.recorrencia,
        contatos: formData.contatos,
      };

      if (formData.id && eventIdFromParams) {
        updateEvent(eventDataForContext);
        Toast.show({ type: 'success', text1: 'Evento Atualizado!' });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...newEventData } = eventDataForContext;
        addEvent(newEventData as Omit<EventType, 'id'>);
        Toast.show({ type: 'success', text1: 'Evento Criado!' });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{});
      navigation.goBack();

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formattedErrors: Partial<Record<keyof EventFormData, string>> = {};
        err.inner.forEach(error => {
          if (error.path) {
            formattedErrors[error.path as keyof EventFormData] = error.message;
          }
        });
        setErrors(formattedErrors);
        Toast.show({ type: 'error', text1: 'Erro de Validação', text2: 'Verifique os campos.' });
      } else {
        console.error("Erro ao salvar evento:", err);
        Alert.alert('Erro', 'Não foi possível salvar o evento.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(()=>{});
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card containerStyle={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Card.Title style={{ color: theme.colors.text }}>
          {formData.id ? 'Editar Evento' : 'Novo Evento'}
        </Card.Title>
        <Card.Divider color={theme.colors.border} />

        <Input
          label="Título do Evento"
          placeholder="Ex: Reunião com Cliente X"
          value={formData.title}
          onChangeText={value => handleChange('title', value)}
          errorMessage={errors.title}
          labelStyle={[styles.inputLabel, { color: theme.colors.textSecondary }]}
          inputStyle={{ color: theme.colors.text }}
          errorStyle={{ color: theme.colors.error }}
        />

        <View style={styles.dateTimeRow}>
          <View style={styles.dateOrTimeContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Data</Text>
            <Button
              title={formData.data ? formatDateUtil(formData.data, 'dd/MM/yyyy') : 'Selecionar Data'}
              onPress={() => setShowDatePicker(true)}
              icon={{ name: 'calendar', type: 'font-awesome', color: theme.colors.onPrimary }}
              buttonStyle={[styles.dateTimePickerButton, styles.dateButtonMargin, { backgroundColor: theme.colors.primary }]}
              titleStyle={{color: theme.colors.onPrimary}}
            />
            {errors.data && <Text style={[styles.errorTextSmall, { color: theme.colors.error }]}>{String(errors.data)}</Text>}
          </View>

          <View style={styles.dateOrTimeContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Hora</Text>
            <Button
              title={formData.hora ? formatDateTimeUtil(formData.hora, 'HH:mm') : 'Selecionar Hora'}
              onPress={() => setShowTimePicker(true)}
              icon={{ name: 'clock-o', type: 'font-awesome', color: theme.colors.onPrimary }}
              buttonStyle={[styles.dateTimePickerButton, styles.timeButtonMargin, { backgroundColor: theme.colors.primary }]}
              titleStyle={{color: theme.colors.onPrimary}}
            />
            {errors.hora && <Text style={[styles.errorTextSmall, { color: theme.colors.error }]}>{String(errors.hora)}</Text>}
          </View>
        </View>

        {showDatePicker && (
          <CustomDateTimePicker
            value={formData.data || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            onClose={() => setShowDatePicker(false)}
          />
        )}
        {showTimePicker && (
          <CustomDateTimePicker
            value={formData.hora || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            onClose={() => setShowTimePicker(false)}
          />
        )}

        <Input
          label="Local (Opcional)"
          placeholder="Ex: Escritório, Fórum XYZ"
          value={formData.local}
          onChangeText={value => handleChange('local', value)}
          errorMessage={errors.local}
          labelStyle={[styles.inputLabel, { color: theme.colors.textSecondary }]}
          inputStyle={{ color: theme.colors.text }}
        />
        <Input
          label="Tipo (Opcional)"
          placeholder="Ex: Reunião, Audiência, Prazo"
          value={formData.tipo}
          onChangeText={value => handleChange('tipo', value)}
          errorMessage={errors.tipo}
          labelStyle={[styles.inputLabel, { color: theme.colors.textSecondary }]}
          inputStyle={{ color: theme.colors.text }}
        />
        <Input
          label="Descrição (Opcional)"
          placeholder="Detalhes adicionais sobre o evento..."
          value={formData.descricao}
          onChangeText={value => handleChange('descricao', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          errorMessage={errors.descricao}
          labelStyle={[styles.inputLabel, { color: theme.colors.textSecondary }]}
          inputStyle={[styles.multilineInput, { color: theme.colors.text }]}
        />

        <Button
          title={formData.id ? 'Atualizar Evento' : 'Salvar Evento'}
          onPress={handleSave}
          buttonStyle={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          titleStyle={{color: theme.colors.onPrimary}}
          icon={{ name: 'save', color: theme.colors.onPrimary }}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    // backgroundColor e borderColor virão do tema
  },
  container: {
    flex: 1,
  },
  dateButtonMargin: { // Novo estilo para margem
    marginRight: 5,
  },
  dateOrTimeContainer: { // Ordem corrigida
    alignItems: 'center',
    flex: 1,
  },
  dateTimePickerButton: {
    // backgroundColor virá do tema
  },
  dateTimeRow: { // Ordem corrigida
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  errorTextSmall: {
    fontSize: 12,
    marginTop: 4,
  },
  inputLabel: {
    // color virá do tema
  },
  label: { // Ordem corrigida
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 10,
  },
  multilineInput: {
    minHeight: 80, // Estilo inline movido
  },
  saveButton: {
    // backgroundColor virá do tema
    marginTop: 20, // Estilo inline movido
  },
  timeButtonMargin: { // Novo estilo para margem
    marginLeft: 5,
  },
});

export default EventDetailsScreen;
