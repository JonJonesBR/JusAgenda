import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types/event';
import * as Haptics from 'expo-haptics';
import moment from 'moment'; // Import moment

// Importações dos componentes de passos
import BasicInfoStep from './BasicInfoStep';
import ProcessDetailsStep from './ProcessDetailsStep';
import ContactsStep from './ContactsStep'; // Assuming default export exists or will be fixed
import ReviewStep from './ReviewStep';
import ProgressIndicator from './ProgressIndicator';
import NavigationButtons from './NavigationButtons';

// Definindo um tipo para a navegação, se você tiver um stack específico
// type EventWizardNavigationProp = NavigationProp<YourStackNavigatorParamList, 'YourScreenNameContainingWizard'>;

interface EventWizardProps {
  initialData?: Partial<Event>;
  onSubmitForm: (event: Event) => void; // Renomeado para clareza, onSubmit já é do React
  isEditMode?: boolean;
  onClose?: () => void; // Opcional: para fechar o wizard (ex: modal)
}

const TOTAL_STEPS = 4;
const STEP_TITLES = ['Informações Básicas', 'Detalhes Processuais', 'Contatos', 'Revisão'];

/**
 * Wizard de criação/edição de eventos
 */
const EventWizard: React.FC<EventWizardProps> = ({
  initialData = {},
  onSubmitForm,
  isEditMode = false,
  onClose,
}) => {
  const [step, setStep] = useState(1); // 1-indexed
  const [formData, setFormData] = useState<Partial<Event>>({
    // Initialize with default values if not provided in initialData
    data: initialData.data instanceof Date ? initialData.data : (initialData.data ? moment(initialData.data, 'YYYY-MM-DD').toDate() : new Date()),
    hora: initialData.hora || moment().format('HH:mm'), // Default to current time string
    ...initialData, // Spread initialData to override defaults if present
  });
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Sincronizar formData com initialData se initialData mudar (ex: ao reabrir em modo de edição)
  useEffect(() => {
    setFormData({
      // Re-initialize with default values if initialData changes
      data: initialData.data instanceof Date ? initialData.data : (initialData.data ? moment(initialData.data, 'YYYY-MM-DD').toDate() : new Date()),
      hora: initialData.hora || moment().format('HH:mm'),
      ...initialData,
    });
    // Consider resetting step to 1 here if initialData changes significantly
    // setStep(1);
  }, [initialData]);


  // Atualizar dados do formulário
  const updateForm = useCallback((newData: Partial<Event>) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const validateStep = (currentStep: number): boolean => {
    Keyboard.dismiss(); // Esconder teclado antes de validar/navegar
    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.title || formData.title.trim() === '') {
          Alert.alert('Campo Obrigatório', 'Por favor, preencha o título do evento.');
          return false;
        }
        if (!formData.data) {
          Alert.alert('Campo Obrigatório', 'Por favor, selecione a data do evento.');
          return false;
        }
        if (!formData.tipo || formData.tipo.trim() === '') {
          Alert.alert('Campo Obrigatório', 'Por favor, selecione o tipo do evento.');
          return false;
        }
        return true;
      case 2: // Process Details (adicione validações se necessário)
        return true;
      case 3: // Contacts (adicione validações se necessário)
        return true;
      // case 4: ReviewStep não tem validação de input, apenas confirmação
      default:
        return true;
    }
  };

  // Avançar para o próximo passo
  const handleNext = useCallback(() => {
    if (!validateStep(step)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      // No último passo (ReviewStep), o botão "Próximo" se torna "Finalizar"
      // e sua ação é o handleSubmit.
      handleSubmitForm();
    }
  }, [step, formData, onSubmitForm]); // Adicionado formData e onSubmitForm às dependências

  // Voltar para o passo anterior
  const handleBack = useCallback(() => {
    Keyboard.dismiss();
    if (step > 1) {
      setStep(s => s - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      // No primeiro passo, voltamos para a tela anterior ou fechamos o wizard
      if (onClose) {
        onClose();
      } else {
        navigation.goBack();
      }
    }
  }, [step, navigation, onClose]);

  // Submeter o formulário (chamado pelo botão "Finalizar" no último passo)
  const handleSubmitForm = useCallback(() => {
    // A validação final pode ser refeita aqui ou confiar que validateStep já cobriu
    // Revalidando os campos obrigatórios do primeiro passo como exemplo:
    if (!formData.title || formData.title.trim() === '' || !formData.data || !formData.tipo || formData.tipo.trim() === '') {
        Alert.alert('Erro de Validação', 'Alguns campos obrigatórios não foram preenchidos. Por favor, revise os passos.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        // Poderia navegar para o primeiro passo com erro, ex: setStep(1);
        return;
    }

    // Certificar que estamos enviando um objeto Event completo, não Partial<Event>
    // Pode ser necessário um mapeamento ou asserção de tipo se alguns campos são opcionais no formulário
    // mas obrigatórios no tipo Event final.
    if (onSubmitForm) {
      onSubmitForm(formData as Event); // Usando asserção de tipo aqui
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    // Após submissão bem-sucedida, fechar o wizard ou navegar para outra tela
    if (onClose) {
        onClose();
    } else {
        // navigation.navigate('AlgumaTelaDeSucesso'); ou navigation.goBack();
    }
  }, [formData, onSubmitForm, onClose, navigation]);

  // Navegar para um passo específico para edição (chamado pelo ReviewStep)
  const handleGoToStep = useCallback((stepToGo: number) => { // stepToGo é 0-indexed vindo do ReviewStep
    if (stepToGo >= 0 && stepToGo < TOTAL_STEPS) {
      setStep(stepToGo + 1); // setStep usa 1-indexed
    }
  }, []);


  // Renderizar o passo atual
  const renderStep = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <BasicInfoStep
            data={formData}
            onUpdate={updateForm}
          />
        );
      case 2:
        return (
          <ProcessDetailsStep
            data={formData}
            onUpdate={updateForm}
          />
        );
      case 3:
        return (
          <ContactsStep
            data={formData}
            onUpdate={updateForm}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={formData}
            onEditStep={handleGoToStep} // Passando a função para navegar para edição
            // onUpdate={updateForm} // Removido, ReviewStep não deve atualizar dados diretamente
          />
        );
      default:
        return null;
    }
  }, [step, formData, updateForm, isEditMode, handleGoToStep]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressIndicator
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        titles={STEP_TITLES}
      />

      <View style={styles.content}>
        {renderStep()}
      </View>

      <NavigationButtons
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={step === 1}
        isLastStep={step === TOTAL_STEPS}
        isEditMode={isEditMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 15, // O padding pode ser melhor nos subcomponentes ou content
  },
  content: {
    flex: 1,
    marginVertical: 10, // Reduzido um pouco
    // O padding de 15px foi removido daqui, pois os componentes de passo já devem ter seu próprio padding
    // ou o ScrollView dentro deles.
  }
});

export default EventWizard;
