import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types/event';
import * as Haptics from 'expo-haptics';

// Importações dos componentes de passos
import BasicInfoStep from './BasicInfoStep';
import ProcessDetailsStep from './ProcessDetailsStep';
import ContactsStep from './ContactsStep';
import ReviewStep from './ReviewStep';
import ProgressIndicator from './ProgressIndicator';
import NavigationButtons from './NavigationButtons';

interface EventWizardProps {
  initialData?: Partial<Event>;
  onSubmit?: (event: Event) => void;
  isEditMode?: boolean;
}

/**
 * Wizard de criação/edição de eventos divido em várias etapas
 * para tornar o processo mais intuitivo e menos sobrecarregado
 */
const EventWizard: React.FC<EventWizardProps> = ({ 
  initialData = {}, 
  onSubmit,
  isEditMode = false
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Event>>(initialData);
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // Total de passos no wizard
  const TOTAL_STEPS = 4;

  // Atualizar dados do formulário
  const updateForm = useCallback((newData: Partial<Event>) => {
    setFormData(prevData => ({...prevData, ...newData}));
    // Feedback tátil para confirmar a atualização
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  // Avançar para o próximo passo
  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      // Feedback tátil para indicar avanço
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      // No último passo, fazemos a submissão
      handleSubmit();
    }
  }, [step]);

  // Voltar para o passo anterior
  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(s => s - 1);
      // Feedback tátil suave para indicar retorno
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      // No primeiro passo, voltamos para a tela anterior
      navigation.goBack();
    }
  }, [step, navigation]);

  // Submeter o formulário
  const handleSubmit = useCallback(() => {
    // Validar se todos os campos obrigatórios foram preenchidos
    if (!formData.titulo || !formData.data || !formData.tipo) {
      // Feedback de erro
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    // Enviar o evento completo
    if (onSubmit) {
      onSubmit(formData as Event);
    }
    
    // Feedback de sucesso
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [formData, onSubmit]);

  // Renderizar o passo atual
  const renderStep = useCallback(() => {
    switch(step) {
      case 1:
        return (
          <BasicInfoStep 
            data={formData} 
            onUpdate={updateForm} 
            isEditMode={isEditMode}
          />
        );
      case 2:
        return (
          <ProcessDetailsStep 
            data={formData} 
            onUpdate={updateForm}
            isEditMode={isEditMode}
          />
        );
      case 3:
        return (
          <ContactsStep 
            data={formData} 
            onUpdate={updateForm}
            isEditMode={isEditMode}
          />
        );
      case 4:
        return (
          <ReviewStep 
            data={formData} 
            onUpdate={updateForm}
            isEditMode={isEditMode}
          />
        );
      default:
        return null;
    }
  }, [step, formData, updateForm, isEditMode]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressIndicator 
        currentStep={step} 
        totalSteps={TOTAL_STEPS} 
        titles={['Informações Básicas', 'Detalhes Processuais', 'Contatos', 'Revisão']}
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
    padding: 15,
  },
  content: {
    flex: 1,
    marginVertical: 20,
  }
});

export default EventWizard;
