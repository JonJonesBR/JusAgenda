// src/components/EventWizard/index.tsx
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Yup from 'yup';
import { useTheme } from '../../contexts/ThemeContext';
import { Event as EventType, Contact as EventContact, RecurrenceRule, Reminder, EventStatus } from '../../types/event'; // Usando EventType
import { EVENT_TYPES, EVENT_TYPE_LABELS, PRIORIDADES, PRIORIDADE_LABELS } from '../../constants'; // Usando constantes atualizadas
import { formatDate, formatTime, parseDateString, combineDateTime, ensureDateObject } from '../../utils/dateUtils'; // Usando dateUtils atualizados

import BasicInfoStep from './BasicInfoStep';
import ProcessDetailsStep from './ProcessDetailsStep';
import ContactsStep from './ContactsStep';
import ReviewStep from './ReviewStep';
import ProgressIndicator from './ProgressIndicator';
import NavigationButtons from './NavigationButtons';
import { Toast } from '../ui/Toast'; // Usando o Toast atualizado

// Tipagem para os dados do formulário do assistente
export interface EventWizardFormData extends Omit<Partial<EventType>, 'id' | 'data' | 'hora' | 'contacts' | 'reminders'> {
  // Campos que precisam de tratamento especial ou tipo diferente no formulário
  data?: Date | null; // Usar objeto Date para o picker
  hora?: Date | null; // Usar objeto Date para o picker
  contacts?: EventContact[];
  reminders?: Reminder[]; // Array de números (minutos)
  // Adicionar outros campos específicos do formulário se necessário
}

// Props para o componente EventWizard
interface EventWizardProps {
  initialData?: EventType | null; // Dados iniciais para edição
  onSubmitForm: (eventData: EventType) => Promise<void | boolean>; // Função chamada ao submeter o formulário completo
  onCancel?: () => void; // Função chamada ao cancelar o assistente
  isReadOnly?: boolean; // Se o assistente está em modo de apenas leitura
}

// Nomes dos passos para referência
const STEP_NAMES = ['basicInfo', 'processDetails', 'contacts', 'review'] as const;
type StepName = typeof STEP_NAMES[number];

const EventWizard: React.FC<EventWizardProps> = ({
  initialData,
  onSubmitForm,
  onCancel,
  isReadOnly = false,
}) => {
  const { theme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<EventWizardFormData>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EventWizardFormData, string>>>({});

  // Esquema de validação com Yup
  const eventSchema = Yup.object().shape<Record<keyof EventType, Yup.AnySchema>>({
    id: Yup.string().optional(), // ID é opcional na criação, mas pode existir na edição
    title: Yup.string().required('O título é obrigatório.').min(3, 'O título deve ter pelo menos 3 caracteres.'),
    data: Yup.string().required('A data é obrigatória.').matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD).'),
    hora: Yup.string().nullable().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM).').optional(),
    eventType: Yup.string().oneOf(Object.values(EVENT_TYPES)).required('O tipo de evento é obrigatório.'),
    description: Yup.string().optional().nullable(),
    local: Yup.string().optional().nullable(),
    status: Yup.string<EventStatus>().optional().nullable(),
    isAllDay: Yup.boolean().optional(),
    numeroProcesso: Yup.string().when('eventType', {
        is: (val: string) => val === EVENT_TYPES.AUDIENCIA || val === EVENT_TYPES.PRAZO_PROCESSUAL,
        then: schema => schema.required('Número do processo é obrigatório para este tipo de evento.'),
        otherwise: schema => schema.optional().nullable(),
    }),
    vara: Yup.string().optional().nullable(),
    comarca: Yup.string().optional().nullable(),
    instancia: Yup.string().optional().nullable(),
    naturezaAcao: Yup.string().optional().nullable(),
    faseProcessual: Yup.string().optional().nullable(),
    linkProcesso: Yup.string().url('Link do processo inválido.').optional().nullable(),
    contacts: Yup.array().of(
      Yup.object().shape<Record<keyof EventContact, Yup.AnySchema>>({
        id: Yup.string().required(),
        name: Yup.string().required('Nome do contato é obrigatório.'),
        phone: Yup.string().optional().nullable(),
        email: Yup.string().email('Email do contato inválido.').optional().nullable(),
        role: Yup.string().optional().nullable(),
      })
    ).optional().nullable(),
    recurrenceRule: Yup.object<RecurrenceRule>().optional().nullable(), // TODO: Adicionar validação para RecurrenceRule
    reminders: Yup.array().of(Yup.number().min(0, 'Lembrete deve ser um valor positivo.')).optional().nullable(),
    createdBy: Yup.string().optional().nullable(),
    createdAt: Yup.string().optional().nullable(),
    updatedAt: Yup.string().optional().nullable(),
    cor: Yup.string().optional().nullable(),
    anexos: Yup.array().optional().nullable(), // TODO: Adicionar validação para Anexos
    clienteId: Yup.string().optional().nullable(),
    clienteNome: Yup.string().optional().nullable(),
    prioridade: Yup.string().oneOf(Object.values(PRIORIDADES)).optional().nullable(),
    dataFim: Yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido.').optional().nullable(),
    horaFim: Yup.string().matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido.').optional().nullable(),
    observacoes: Yup.string().optional().nullable(),
    presencaObrigatoria: Yup.boolean().optional(),
    dataNascimento: Yup.string().optional().nullable(), // Se usado, adicionar validação de formato
    tipo: Yup.string().optional().nullable(), // Se 'tipo' for um alias de eventType, pode remover
  });


  // Carrega os dados iniciais no formulário quando o componente monta ou initialData muda
  useEffect(() => {
    if (initialData) {
      const dataDate = initialData.data ? parseDateString(initialData.data) : null;
      let horaDate: Date | null = null;
      if (initialData.data && initialData.hora) {
          horaDate = combineDateTime(initialData.data, initialData.hora);
      } else if (initialData.data) { // Se só tem data, a hora pode ser null ou um Date com 00:00
          horaDate = parseDateString(initialData.data); // Hora será 00:00
      }


      setFormData({
        ...initialData, // Espalha todos os campos de EventType
        data: dataDate, // Sobrescreve com objeto Date
        hora: horaDate,   // Sobrescreve com objeto Date
        // Garanta que contacts e reminders sejam arrays vazios se não definidos, para evitar problemas com componentes controlados
        contacts: initialData.contacts || [],
        reminders: initialData.reminders || [],
      });
    } else {
      // Valores padrão para um novo evento
      setFormData({
        title: '',
        data: new Date(), // Data atual como padrão
        hora: null, //new Date(), // Hora atual como padrão, ou null
        eventType: EVENT_TYPES.REUNIAO, // Tipo padrão
        status: 'scheduled',
        isAllDay: false,
        contacts: [],
        reminders: [],
        prioridade: PRIORIDADES.MEDIA,
      });
    }
  }, [initialData]);

  const handleFieldUpdate = useCallback((field: keyof EventWizardFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined })); // Limpa o erro do campo ao editar
    }
  }, [formErrors]);

  const validateStep = async (stepName: StepName): Promise<boolean> => {
    let fieldsToValidate: (keyof EventType)[] = [];
    // Define quais campos validar para cada passo
    switch (stepName) {
      case 'basicInfo':
        fieldsToValidate = ['title', 'data', 'hora', 'eventType', 'local', 'description', 'isAllDay', 'cor'];
        break;
      case 'processDetails':
        fieldsToValidate = ['numeroProcesso', 'vara', 'comarca', 'instancia', 'naturezaAcao', 'faseProcessual', 'linkProcesso', 'prioridade', 'presencaObrigatoria', 'observacoes'];
        break;
      case 'contacts':
        fieldsToValidate = ['contacts', 'clienteId', 'clienteNome']; // Validação de 'contacts' é feita pelo schema do array
        break;
      default:
        return true; // Passo de revisão não tem validação própria aqui
    }

    // Cria um sub-schema apenas com os campos do passo atual
    const stepSchemaObject: Partial<Record<keyof EventType, Yup.AnySchema>> = {};
    fieldsToValidate.forEach(field => {
      if (eventSchema.fields[field]) {
        stepSchemaObject[field] = eventSchema.fields[field];
      }
    });
    const stepSchema = Yup.object().shape(stepSchemaObject);

    try {
      // Prepara os dados para validação (convertendo Date para string)
      const dataToValidate = {
        ...formData,
        data: formData.data ? formatDate(formData.data, 'yyyy-MM-dd') : undefined,
        hora: formData.hora ? formatTime(formData.hora) : undefined,
      };
      await stepSchema.validate(dataToValidate, { abortEarly: false });
      setFormErrors({}); // Limpa erros se a validação do passo for bem-sucedida
      return true;
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const errors: Partial<Record<keyof EventWizardFormData, string>> = {};
        err.inner.forEach(error => {
          if (error.path && !errors[error.path as keyof EventWizardFormData]) {
            errors[error.path as keyof EventWizardFormData] = error.message;
          }
        });
        setFormErrors(errors);
        Toast.show({ type: 'error', text1: 'Campos Inválidos', text2: 'Por favor, corrija os campos destacados.' });
      }
      return false;
    }
  };


  const handleNext = async () => {
    const currentStepName = STEP_NAMES[currentStepIndex];
    const isValid = await validateStep(currentStepName);

    if (isValid) {
      if (currentStepIndex < STEP_NAMES.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Último passo - Submeter formulário
        await handleSubmitForm();
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else if (onCancel) {
      onCancel(); // Se estiver no primeiro passo e houver onCancel, chama-o
    }
  };

  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    // Converte formData (EventWizardFormData) para EventType antes de validar/submeter
    const eventToSubmit: Partial<EventType> = {
      ...formData,
      id: initialData?.id, // Mantém o ID se estiver a editar
      data: formData.data ? formatDate(formData.data, 'yyyy-MM-dd') : '', // Garante que data é string ou string vazia
      hora: formData.hora ? formatTime(formData.hora) : undefined, // hora é opcional
      // Garante que campos opcionais que não foram tocados sejam undefined ou o valor correto
      contacts: formData.contacts && formData.contacts.length > 0 ? formData.contacts : undefined,
      reminders: formData.reminders && formData.reminders.length > 0 ? formData.reminders : undefined,
    };

    try {
      await eventSchema.validate(eventToSubmit, { abortEarly: false, context: { isNew: !initialData?.id } });
      // Se a validação passar, chama a função de submissão passada por props
      const submissionResult = await onSubmitForm(eventToSubmit as EventType); // Confia que a validação preencheu os campos obrigatórios
      if (submissionResult !== false) { // Permite que onSubmitForm retorne false para impedir o fechamento
         Toast.show({ type: 'success', text1: 'Evento Salvo!', text2: `O evento "${eventToSubmit.title}" foi salvo.` });
        // Opcional: resetar formulário ou navegar para outra tela após sucesso
      }
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const errors: Partial<Record<keyof EventWizardFormData, string>> = {};
        err.inner.forEach(error => {
          if (error.path) {
            // Mapear erros de 'data' (string) para 'data' (Date) se necessário para o formulário
            const formPath = error.path as keyof EventWizardFormData;
            if (!errors[formPath]) {
              errors[formPath] = error.message;
            }
          }
        });
        setFormErrors(errors);
        Toast.show({ type: 'error', text1: 'Erro de Validação', text2: 'Verifique os campos do formulário.' });
        // Encontrar o primeiro passo com erro e navegar para ele
        for (let i = 0; i < STEP_NAMES.length; i++) {
            const stepName = STEP_NAMES[i];
            const stepFields = getFieldsForStep(stepName); // Função auxiliar para obter campos de um passo
            if (stepFields.some(field => errors[field as keyof EventWizardFormData])) {
                setCurrentStepIndex(i);
                break;
            }
        }

      } else {
        console.error('Erro de submissão:', err);
        Toast.show({ type: 'error', text1: 'Erro ao Salvar', text2: 'Não foi possível salvar o evento.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função auxiliar para obter campos de um passo (para navegação de erro)
  const getFieldsForStep = (stepName: StepName): (keyof EventWizardFormData)[] => {
    switch (stepName) {
      case 'basicInfo': return ['title', 'data', 'hora', 'eventType', 'local', 'description', 'isAllDay', 'cor'];
      case 'processDetails': return ['numeroProcesso', 'vara', 'comarca', 'instancia', 'naturezaAcao', 'faseProcessual', 'linkProcesso', 'prioridade', 'presencaObrigatoria', 'observacoes'];
      case 'contacts': return ['contacts', 'clienteId', 'clienteNome'];
      default: return [];
    }
  };


  const renderStepContent = (): ReactNode => {
    const stepProps = {
      formData,
      updateField: handleFieldUpdate,
      errors: formErrors,
      isReadOnly,
      theme, // Passa o tema para os steps, se eles precisarem
    };

    switch (STEP_NAMES[currentStepIndex]) {
      case 'basicInfo':
        return <BasicInfoStep {...stepProps} eventTypes={EVENT_TYPE_LABELS} />;
      case 'processDetails':
        return <ProcessDetailsStep {...stepProps} prioridades={PRIORIDADE_LABELS} />;
      case 'contacts':
        return <ContactsStep {...stepProps} />;
      case 'review':
        // Para o ReviewStep, passamos os dados formatados para exibição
        const reviewData = {
            ...formData,
            data: formData.data ? formatDate(formData.data, 'dd/MM/yyyy') : 'Não definida',
            hora: formData.hora ? formatTime(formData.hora) : 'Não definida',
            eventType: formData.eventType ? EVENT_TYPE_LABELS[formData.eventType as keyof typeof EVENT_TYPE_LABELS] || formData.eventType : 'Não definido',
            prioridade: formData.prioridade ? PRIORIDADE_LABELS[formData.prioridade as keyof typeof PRIORIDADE_LABELS] || formData.prioridade : 'Não definida',
        };
        return <ReviewStep formData={reviewData as any} onEditStep={setCurrentStepIndex} isReadOnly={isReadOnly} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flexContainer}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Ajuste conforme necessário
    >
      <View style={[styles.wizardContainer, { backgroundColor: theme.colors.background }]}>
        <ProgressIndicator
          currentStep={currentStepIndex + 1} // +1 porque currentStep é base 0
          totalSteps={STEP_NAMES.length}
          showStepText
        />
        <ScrollView
          style={styles.stepContainer}
          contentContainerStyle={styles.stepContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>
        {!isReadOnly && (
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            isFirstStep={currentStepIndex === 0 && !onCancel} // Considera onCancel para o comportamento do botão voltar no primeiro passo
            isLastStep={currentStepIndex === STEP_NAMES.length - 1}
            isLoadingNext={isSubmitting && currentStepIndex === STEP_NAMES.length - 1}
            canGoNext={!isSubmitting} // Desabilita Next/Finalizar enquanto submete
            backText={currentStepIndex === 0 && onCancel ? 'Cancelar' : 'Anterior'}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  wizardContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1, // Permite que o ScrollView ocupe o espaço disponível
    paddingHorizontal: 16, // Usar theme.spacing.md
    paddingTop: 16, // Usar theme.spacing.md
  },
  stepContentContainer: {
    paddingBottom: 20, // Espaço no final do scroll
  },
});

export default EventWizard;
