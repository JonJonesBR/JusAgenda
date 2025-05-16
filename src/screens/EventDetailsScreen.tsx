import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  Text,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Button, Card, Icon, Input as RNEInput } from '@rneui/themed'; // Renamed Input to RNEInput to avoid conflict with our custom Input if we decide to use it here
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useEvents, Event as ContextEventType } from '../contexts/EventCrudContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import type { Event as EventTypeFromTypes } from '../types/event'; // This is from src/types/event.ts
import * as yup from 'yup';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate } from '../utils/dateUtils';
import moment from 'moment'; // Import moment

// Define a consistent shape for the form data internally in this screen
interface EventFormData {
  id?: string;
  title: string;
  tipo: string;
  data: Date; // Store date as Date object in form state
  hora?: string; // Add field for time string
  cliente: string;
  local?: string;
  descricao?: string;
  numeroProcesso?: string;
  vara?: string;
  prioridade?: string;
  presencaObrigatoria?: boolean;
  lembretes?: string[];
  observacoes?: string;
  // Add other fields from EventTypeFromTypes if they are editable here
  competencia?: string;
  comarca?: string;
  estado?: string;
  reu?: string;
  telefoneCliente?: string;
  emailCliente?: string;
  telefoneReu?: string;
  emailReu?: string;
  juiz?: string;
  promotor?: string;
  perito?: string;
  prepostoCliente?: string;
  testemunhas?: string;
  documentosNecessarios?: string;
  valor?: string;
  honorarios?: string;
  prazoDias?: string;
  fase?: string;
  contatos?: EventTypeFromTypes['contatos'];
}

type EventDetailsParams = {
  event?: Partial<EventTypeFromTypes>; // This comes from route params, uses names from src/types/event.ts
  editMode?: boolean;
};

type RootStackParamList = {
  EventDetails: EventDetailsParams;
  Home: undefined;
  EventList?: undefined;
};

type EventDetailsNavigationProp = NavigationProp<RootStackParamList, 'EventDetails'>;
type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

// Schema validates against EventFormData names
const eventSchema = yup.object().shape({
  id: yup.string().required(),
  title: yup.string().trim().required('Título do Compromisso obrigatório'),
  tipo: yup.string().required('Tipo de Compromisso obrigatório'),
  data: yup.date().required('Data do compromisso obrigatória').typeError('Data inválida'),
  cliente: yup.string().trim().required('Cliente obrigatório'),
  local: yup.string().trim().nullable(),
  descricao: yup.string().trim().nullable(),
  numeroProcesso: yup.string().trim().nullable(),
  vara: yup.string().trim().nullable(),
  prioridade: yup.string().oneOf(['alta', 'media', 'baixa', 'urgente', '', undefined]).nullable(),
  presencaObrigatoria: yup.boolean().nullable(),
  observacoes: yup.string().trim().nullable(),
});

const componentColors = {
  white: '#FFFFFF',
  black: '#000000',
  defaultTextSecondary: '#A9A9A9',
  defaultGrey: '#CCCCCC',
};

const EventDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const route = useRoute<EventDetailsRouteProp>();
  const { event: initialEventData, editMode: initialEditMode = false } = route.params ?? {};
  const isCreating = !initialEventData?.id;
  const [isEditMode, setIsEditMode] = useState(initialEditMode || !!initialEventData?.id);

  const { deleteEvent, addEvent, updateEvent } = useEvents();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<EventFormData>(() => {
    const defaultDate = new Date();
    const initialDate = initialEventData?.data ? new Date(initialEventData.data) : defaultDate;
    const initialTime = initialEventData?.hora || ''; // Get initial time string

    // initialEventData uses names from src/types/event.ts (e.g., initialEventData.title, initialEventData.data, initialEventData.tipo)
    return {
      id: initialEventData?.id || Date.now().toString(), // Ensure ID for new events
      title: initialEventData?.title || '',
      tipo: initialEventData?.tipo || '',
      data: initialDate,
      hora: initialTime, // Initialize hora field
      local: initialEventData?.local || '',
      cliente: initialEventData?.cliente || '',
      descricao: initialEventData?.descricao || '',
      numeroProcesso: initialEventData?.numeroProcesso || '',
      vara: initialEventData?.vara || '',
      prioridade: initialEventData?.prioridade || '',
      presencaObrigatoria: initialEventData?.presencaObrigatoria || false,
      lembretes: initialEventData?.lembretes || undefined,
      observacoes: initialEventData?.observacoes || '',
      // Map other fields from initialEventData if needed
      competencia: initialEventData?.competencia || '',
      comarca: initialEventData?.comarca || '',
      estado: initialEventData?.estado || '',
      reu: initialEventData?.reu || '',
      telefoneCliente: initialEventData?.telefoneCliente || '',
      emailCliente: initialEventData?.emailCliente || '',
      telefoneReu: initialEventData?.telefoneReu || '',
      emailReu: initialEventData?.emailReu || '',
      juiz: initialEventData?.juiz || '',
      promotor: initialEventData?.promotor || '',
      perito: initialEventData?.perito || '',
      prepostoCliente: initialEventData?.prepostoCliente || '',
      testemunhas: initialEventData?.testemunhas || '',
      documentosNecessarios: initialEventData?.documentosNecessarios || '',
      valor: initialEventData?.valor || '',
      honorarios: initialEventData?.honorarios || '',
      prazoDias: initialEventData?.prazoDias || '',
      fase: initialEventData?.fase || '',
      contatos: initialEventData?.contatos || [],
    };
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isCreating ? 'Novo Compromisso' : (isEditMode ? 'Editar Compromisso' : 'Detalhes do Compromisso')
    });
  }, [navigation, isCreating, isEditMode]);

  const getEventTypeDetails = useCallback(() => {
    const eventType = formData.tipo?.toLowerCase();
    switch (eventType) {
      case 'audiencia': return { name: 'gavel', color: theme.colors.primary, label: 'Audiência' };
      case 'reuniao': return { name: 'groups', color: theme.colors.secondary || '#03dac6', label: 'Reunião' };
      case 'prazo': return { name: 'timer-outline', type: 'material-community', color: theme.colors.error || '#ff0266', label: 'Prazo' };
      case 'despacho': return { name: 'receipt-long', type: 'material', color: theme.colors.info || '#018786', label: 'Despacho' };
      default: return { name: 'calendar-blank-outline', type: 'material-community', color: theme.colors.textSecondary || componentColors.defaultTextSecondary, label: formData.tipo || 'Evento' };
    }
  }, [formData.tipo, theme.colors]);

  const getStatusBadge = useCallback(() => {
    const currentDate = formData.data;
    if (!currentDate) return { label: 'Data Pendente', color: componentColors.defaultGrey };
    const now = new Date();
    const eventDate = new Date(currentDate);
    now.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate < now) return { label: 'Realizado', color: theme.colors.success };
    if (eventDate.getTime() === now.getTime()) return { label: 'Hoje', color: theme.colors.warning };
    return { label: 'Agendado', color: theme.colors.primary };
  }, [formData.data, theme.colors]);

  // Define a union type for all possible field values in EventFormData
  type EventFormFieldValue = EventFormData[keyof EventFormData];

  const handleInputChange = useCallback((field: keyof EventFormData, value: EventFormFieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.data;
    setShowDatePicker(Platform.OS === 'ios');
    if (currentDate) {
        // Update both date and time
        handleInputChange('data', currentDate);
        handleInputChange('hora', moment(currentDate).format('HH:mm')); // Extract and format time
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      setIsSaving(true);
      // formData already uses Date object for data, schema expects Date.
      // Validate formData including the new hora field
      await eventSchema.validate({ ...formData, id: formData.id || Date.now().toString() }, { abortEarly: false });
      
      const eventForContextAPI: ContextEventType = {
        id: formData.id!,
        title: formData.title!,
        date: formatDate(formData.data), // Convert Date object to YYYY-MM-DD string
        hora: formData.hora, // Include the hora string
        type: formData.tipo, // EventCrudContext uses 'type'
        cliente: formData.cliente,
        local: formData.local,
        description: formData.descricao, // EventCrudContext uses 'description'
        numeroProcesso: formData.numeroProcesso,
        vara: formData.vara,
        prioridade: formData.prioridade,
        presencaObrigatoria: formData.presencaObrigatoria,
        lembretes: Array.isArray(formData.lembretes) ? formData.lembretes : undefined,
        observacoes: formData.observacoes,
        // Map other fields
        competencia: formData.competencia,
        comarca: formData.comarca,
        estado: formData.estado,
        reu: formData.reu,
        telefoneCliente: formData.telefoneCliente,
        emailCliente: formData.emailCliente,
        telefoneReu: formData.telefoneReu,
        emailReu: formData.emailReu,
        juiz: formData.juiz,
        promotor: formData.promotor,
        perito: formData.perito,
        prepostoCliente: formData.prepostoCliente,
        testemunhas: formData.testemunhas,
        documentosNecessarios: formData.documentosNecessarios,
        valor: formData.valor,
        honorarios: formData.honorarios,
        prazoDias: formData.prazoDias,
        fase: formData.fase,
        contatos: formData.contatos,
      };

      if (isEditMode && eventForContextAPI.id) {
        await updateEvent(eventForContextAPI);
        Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Compromisso atualizado!' });
      } else {
        // For addEvent, context expects Omit<ContextEventType, 'id'>.
        // Create a new object without id, or ensure addEvent can handle it if id is already generated client-side.
        const { id, ...eventToAdd } = eventForContextAPI;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const unusedId = id; // To satisfy linter if id is not used further
        await addEvent(eventToAdd as Omit<ContextEventType, 'id'>);
        Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Compromisso criado!' });
      }
      navigation.goBack();
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError) {
        Alert.alert('Erro de Validação', error.errors.join('\n'));
      } else {
        Alert.alert('Erro', `Não foi possível salvar o compromisso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!formData.id) return;
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este compromisso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await deleteEvent(formData.id!);
              Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Compromisso excluído.' });
              navigation.goBack();
            } catch (error: unknown) {
              Alert.alert('Erro', `Não foi possível excluir o compromisso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
              setIsSaving(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const DetailItem: React.FC<{icon: string; label: string; value?: string | number | boolean | string[] | null; theme: Theme; iconType?: string;}> =
    ({ icon, label, value, theme: currentTheme, iconType = "material-community" }) => {
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            if (typeof value !== 'boolean' && !Array.isArray(value)) return null;
            if (Array.isArray(value) && value.length === 0) return null;
        }
        let displayValue = '';
        if (typeof value === 'boolean') {
          displayValue = value ? 'Sim' : 'Não';
        } else if (Array.isArray(value)) {
          displayValue = value.join(', ');
        } else {
          displayValue = String(value);
        }
        if (displayValue.trim() === '') return null;

        return (
            <View style={styles.detailItemContainer}>
                <Icon name={icon} type={iconType} size={20} color={currentTheme.colors.textSecondary} style={styles.detailItemIcon} />
                <View style={styles.detailItemTextContainer}>
                    <Text style={[styles.detailItemLabel, { color: currentTheme.colors.textSecondary }]}>{label}</Text>
                    <Text style={[styles.detailItemValue, { color: currentTheme.colors.text }]} selectable={true}>{displayValue}</Text>
                </View>
            </View>
        );
    };

  const renderForm = () => (
    <Card containerStyle={[styles.formCard, { backgroundColor: theme.colors.card }]}>
      <ScrollView style={styles.formScrollView} keyboardShouldPersistTaps="handled">
         <RNEInput // Using RNEInput
            label="Título do Compromisso *"
            placeholder="Ex: Audiência Processo X"
            value={formData.title || ''} // Changed to formData.title
            onChangeText={(text) => handleInputChange('title', text)} // Changed to title
            disabled={isSaving}
          />
         <RNEInput // Using RNEInput
            label="Tipo de Compromisso *"
            placeholder="Ex: Audiência, Reunião"
            value={formData.tipo || ''} // Stays formData.tipo
            onChangeText={(text) => handleInputChange('tipo', text)}
            disabled={isSaving}
         />
        <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={isSaving}>
            <RNEInput // Using RNEInput
                label="Data e Hora *"
                value={formData.data ? `${formatDate(new Date(formData.data), 'DD/MM/YYYY')} ${formData.hora || ''}`.trim() : ''} // Display formatted date and time
                placeholder="Selecione a data e hora"
                editable={false}
                rightIcon={<Icon name="calendar-today" color={theme.colors.textSecondary} />}
            />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formData.data ? new Date(formData.data) : new Date()} // Use formData.data directly
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()} // Example: No past dates for new events
          />
        )}
        <RNEInput // Using RNEInput
          label="Local"
          placeholder="Local do compromisso"
          value={formData.local || ''} // Changed to formData.local
          onChangeText={(text) => handleInputChange('local', text)} // Changed to local
          disabled={isSaving}
        />
        <RNEInput // Using RNEInput
          label="Cliente *"
          placeholder="Nome do cliente principal"
          value={formData.cliente || ''}
          onChangeText={(text) => handleInputChange('cliente', text)}
          disabled={isSaving}
        />
         <RNEInput // Using RNEInput
            label="Descrição / Observações"
            placeholder="Detalhes adicionais..."
            value={formData.descricao || ''} // Changed to formData.descricao
            onChangeText={(text) => handleInputChange('descricao', text)} // Changed to descricao
            multiline
            numberOfLines={4}
            containerStyle={styles.multilineInputContainer}
            inputStyle={styles.multilineInput}
            disabled={isSaving}
        />
        <RNEInput label="Número do Processo" value={formData.numeroProcesso || ''} onChangeText={(text) => handleInputChange('numeroProcesso', text)} disabled={isSaving}/>
        <RNEInput label="Vara/Tribunal" value={formData.vara || ''} onChangeText={(text) => handleInputChange('vara', text)} disabled={isSaving}/>
        {/* Add other RNEInput fields for prioridade, presencaObrigatoria, etc. as needed */}
        <View style={styles.formActionButtons}>
          <Button
            title="Cancelar"
            type="outline"
            onPress={() => navigation.goBack()}
            disabled={isSaving}
            buttonStyle={[styles.formButton, { borderColor: componentColors.defaultGrey }]}
            titleStyle={{ color: theme.colors.text }}
            containerStyle={styles.formButtonContainerLeft}
          />
          <Button
            title={isEditMode ? "Salvar Alterações" : "Criar Compromisso"}
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            buttonStyle={[styles.formButton, { backgroundColor: theme.colors.primary }]}
            containerStyle={styles.formButtonContainerRight}
            icon={isCreating ? {name: 'check', color: componentColors.white} : undefined }
            titleStyle={{color: componentColors.white}}
          />
        </View>
      </ScrollView>
    </Card>
  );

  const renderDisplayMode = () => (
     <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary as string]} // Ensure second color is also a string
          style={[styles.gradientHeader, { paddingTop: insets.top + 10 }]}
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
        >
            <View style={styles.displayHeader}>
                <View style={styles.headerTitleContainer}>
                    <Icon {...getEventTypeDetails()} size={28} style={styles.headerTypeIcon}/>
                    <Text style={[styles.headerScreenTitle, { color: componentColors.white}]}>
                        {formData.title || "Detalhes do Compromisso"} {/* Changed to formData.title */}
                    </Text>
                </View>
                <View style={[styles.headerBadge, { backgroundColor: getStatusBadge().color }]}>
                    <Text style={[styles.headerBadgeText, { color: componentColors.white}]}>{getStatusBadge().label}</Text>
                </View>
            </View>
        </LinearGradient>
        <View style={styles.contentContainer}>
            <Card containerStyle={[styles.detailCard, { backgroundColor: theme.colors.card }]}>
                <Card.Title style={[styles.detailCardTitle, { color: theme.colors.text }]}>
                    <Text>Informações Principais</Text>
                </Card.Title>
                <Card.Divider color={theme.colors.border} />
                 <DetailItem icon="tag-outline" label="Tipo" value={getEventTypeDetails().label} theme={theme} />
                 <DetailItem icon="calendar-month-outline" label="Data e Hora" value={formData.data ? formatDate(new Date(formData.data)) : 'N/A'} theme={theme} />
                 <DetailItem icon="map-marker-outline" label="Local" value={formData.local} theme={theme} />
                 <DetailItem icon="account-outline" label="Cliente" value={formData.cliente} theme={theme} />
                 <DetailItem icon="text-long" label="Descrição/Obs." value={formData.descricao} theme={theme} />
            </Card>
            {(formData.numeroProcesso || formData.vara || formData.prioridade || formData.observacoes || formData.presencaObrigatoria !== undefined || (formData.lembretes && formData.lembretes.length > 0)) && (
                <Card containerStyle={[styles.detailCard, { backgroundColor: theme.colors.card }]}>
                    <Card.Title style={[styles.detailCardTitle, { color: theme.colors.text }]}><Text>Detalhes Adicionais</Text></Card.Title>
                    <Card.Divider color={theme.colors.border}/>
                    <DetailItem icon="pound-box-outline" label="Nº Processo" value={formData.numeroProcesso} theme={theme} />
                    <DetailItem icon="gavel" label="Vara/Tribunal" value={formData.vara} theme={theme} />
                    <DetailItem icon="priority-high" label="Prioridade" value={formData.prioridade} theme={theme} />
                    <DetailItem icon="comment-text-outline" label="Observações" value={formData.observacoes} theme={theme} />
                    <DetailItem icon={formData.presencaObrigatoria ? "account-check-outline" : "account-off-outline"} label="Presença Obrigatória" value={formData.presencaObrigatoria} theme={theme} />
                    <DetailItem 
                        icon={(formData.lembretes && formData.lembretes.length > 0) ? "bell-check-outline" : "bell-off-outline"} 
                        label="Lembretes" 
                        value={Array.isArray(formData.lembretes) ? formData.lembretes.join(', ') : undefined} 
                        theme={theme} 
                    />
                </Card>
            )}
            <View style={styles.viewActionButtons}>
                <Button
                    title="Excluir"
                    type="outline"
                    icon={<Icon name="delete-outline" type="material-community" color={theme.colors.error} />}
                    buttonStyle={[styles.viewButton, { borderColor: theme.colors.error }]}
                    titleStyle={{ color: theme.colors.error }}
                    onPress={handleDelete}
                    loading={isSaving}
                    disabled={isSaving || isCreating} // Disable delete for new unsaved event
                    containerStyle={styles.formButtonContainerLeft}
                />
                 <Button
                    title="Editar"
                    icon={<Icon name="pencil-outline" type="material-community" color={componentColors.white} />}
                    buttonStyle={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                    titleStyle={{ color: componentColors.white }}
                    onPress={() => setIsEditMode(true)}
                    disabled={isSaving}
                    containerStyle={styles.formButtonContainerRight}
                />
            </View>
        </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
        <StatusBar
            barStyle={theme.dark ? 'light-content' : 'dark-content'} // Use theme.dark directly
            backgroundColor={'transparent'}
            translucent={true}
        />
        {isEditMode || isCreating ? renderForm() : renderDisplayMode()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
      padding: 16,
  },
  detailCard: {
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 16,
    padding: 16,
  },
  detailCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  detailItemContainer: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginBottom: 12,
  },
  detailItemIcon: {
      marginRight: 12,
      marginTop: 2,
  },
  detailItemLabel: {
      fontSize: 13,
      marginBottom: 2,
      opacity: 0.8,
  },
  detailItemTextContainer: {
      flex: 1,
  },
  detailItemValue: {
      fontSize: 16,
      lineHeight: 22,
  },
  displayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formActionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
  },
  formButton: {},
  formButtonContainerLeft: {
    flex: 1,
    marginRight: 8,
  },
  formButtonContainerRight: {
    flex: 1,
    marginLeft: 8,
  },
  formCard: {
    borderRadius: 16,
    elevation: 3,
    margin: 16,
    padding: 20,
    shadowColor: componentColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formScrollView: {},
  gradientHeader: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerBadge: {
    borderRadius: 16,
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerScreenTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      marginRight: 10,
  },
  headerTypeIcon: {
      marginRight: 10,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  multilineInputContainer: {
     height: 120,
  },
  scrollView: {
      flex: 1,
  },
  viewActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
   viewButton: {
      borderRadius: 8,
      paddingVertical: 10,
  },
});

export default EventDetailsScreen;
