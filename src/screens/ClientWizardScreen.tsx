import React, { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import BreadcrumbTrail from '../navigation/BreadcrumbTrail'; // Corrected path
import * as yup from 'yup';

// Passos do wizard para clientes
import ClientBasicInfoStep from '../components/ClientWizard/ClientBasicInfoStep';
import ClientDocumentsStep from '../components/ClientWizard/ClientDocumentsStep';
import ClientAddressStep from '../components/ClientWizard/ClientAddressStep';
import ClientReviewStep from '../components/ClientWizard/ClientReviewStep';
// Corrected paths for wizard components
import ProgressIndicator from '../components/EventWizard/ProgressIndicator';
import NavigationButtons from '../components/EventWizard/NavigationButtons';

// --- Tipo Cliente ---
export interface Client {
  id: string;
  nome: string;
  nomeFantasia?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  rg?: string;
  orgaoEmissor?: string;
  estadoCivil?: string;
  profissao?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  ramoAtividade?: string;
  responsavelLegal?: string;
  documentosAdicionais?: string;
  pontoReferencia?: string;
  dataNascimento?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  observacoes?: string;
  tipo: 'pessoaFisica' | 'pessoaJuridica';
}

// --- Tipos de Navegação ---
type ClientStackParamList = {
  Home: undefined;
  ClientList: undefined;
  ClientWizard: { client?: Partial<Client>; isEditMode?: boolean; readOnly?: boolean };
};

type NavigationProp = NativeStackNavigationProp<ClientStackParamList, 'ClientWizard'>;
type ClientWizardRouteProp = RouteProp<ClientStackParamList, 'ClientWizard'>;

const clientSchema = yup.object().shape({
  tipo: yup.string().oneOf(['pessoaFisica', 'pessoaJuridica']).required('Tipo de cliente obrigatório'),
  nome: yup.string().trim().required('Nome ou Razão Social obrigatório'),
  nomeFantasia: yup.string().trim().when('tipo', {
      is: 'pessoaJuridica',
      then: (schema) => schema.required('Nome Fantasia é obrigatório para Pessoa Jurídica'),
      otherwise: (schema) => schema.nullable(),
  }),
  email: yup.string().email('E-mail inválido').trim().nullable().transform(v => v === '' ? null : v),
  telefone: yup.string().trim().nullable().transform(v => v === '' ? null : v),
  cpf: yup.string().trim().when('tipo', {
    is: 'pessoaFisica',
    then: (schema) => schema.required('CPF obrigatório para Pessoa Física')
                          .matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido'),
    otherwise: (schema) => schema.nullable(),
  }),
  rg: yup.string().trim().when('tipo', { is: 'pessoaFisica', then: (schema) => schema.nullable() }),
  orgaoEmissor: yup.string().trim().when('tipo', { is: 'pessoaFisica', then: (schema) => schema.nullable() }),
  estadoCivil: yup.string().trim().when('tipo', { is: 'pessoaFisica', then: (schema) => schema.nullable() }),
  profissao: yup.string().trim().when('tipo', { is: 'pessoaFisica', then: (schema) => schema.nullable() }),
  dataNascimento: yup.string().trim().when('tipo', { is: 'pessoaFisica', then: (schema) => schema.nullable() }),
  cnpj: yup.string().trim().when('tipo', {
    is: 'pessoaJuridica',
    then: (schema) => schema.required('CNPJ obrigatório para Pessoa Jurídica')
                           .matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'CNPJ inválido'),
    otherwise: (schema) => schema.nullable(),
  }),
  inscricaoEstadual: yup.string().trim().when('tipo', { is: 'pessoaJuridica', then: (schema) => schema.nullable() }),
  inscricaoMunicipal: yup.string().trim().when('tipo', { is: 'pessoaJuridica', then: (schema) => schema.nullable() }),
  ramoAtividade: yup.string().trim().when('tipo', { is: 'pessoaJuridica', then: (schema) => schema.nullable() }),
  responsavelLegal: yup.string().trim().when('tipo', { is: 'pessoaJuridica', then: (schema) => schema.nullable() }),
  endereco: yup.object().shape({
    cep: yup.string().trim().nullable().matches(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    logradouro: yup.string().trim().nullable(),
    numero: yup.string().trim().nullable(),
    complemento: yup.string().trim().nullable(),
    bairro: yup.string().trim().nullable(),
    cidade: yup.string().trim().nullable(),
    estado: yup.string().trim().nullable().max(2, 'UF inválida'),
  }).nullable(),
  observacoes: yup.string().trim().nullable(),
  pontoReferencia: yup.string().trim().nullable(),
  documentosAdicionais: yup.string().trim().nullable(),
  id: yup.string().required(),
});

const ClientWizardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ClientWizardRouteProp>();
  const { client: initialClientData, isEditMode = false, readOnly = false } = route.params ?? {};
  const { theme, isDark } = useTheme(); // Used isDark
  const [step, setStep] = useState(1);

  const [client, setClient] = useState<Partial<Client>>(
    () => initialClientData || {
      id: isEditMode ? undefined : Date.now().toString(),
      nome: '',
      tipo: 'pessoaFisica',
      endereco: undefined,
    }
  );

  useEffect(() => {
      if (initialClientData && initialClientData.id !== client.id) {
          setClient(initialClientData);
          setStep(1);
      }
  }, [initialClientData, client.id]);

  const breadcrumbs = [
    { id: 'home', label: 'Início', onPress: () => navigation.navigate('Home') },
    { id: 'clients', label: 'Clientes', onPress: () => navigation.navigate('ClientList') },
    { id: 'wizard', label: readOnly ? 'Visualizar Cliente' : (isEditMode ? 'Editar Cliente' : 'Novo Cliente') },
  ];

  const TOTAL_STEPS = 4;
  const STEP_TITLES = ['Informações Básicas', 'Documentos', 'Endereço', 'Revisão'];

  const updateClient = useCallback((newData: Partial<Client>) => {
    setClient(prevData => ({ ...prevData, ...newData }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const handleGoToStep = useCallback((stepToGo: number) => {
    if (stepToGo >= 0 && stepToGo < TOTAL_STEPS) {
      setStep(stepToGo + 1);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (readOnly) {
        navigation.goBack();
        return;
    }
    try {
      const dataToValidate = {
        ...client,
        id: client.id || Date.now().toString(),
        tipo: client.tipo || 'pessoaFisica',
        nome: client.nome?.trim() || '',
        email: client.email?.trim() || undefined,
        telefone: client.telefone?.replace(/\D/g, '') || undefined,
        cpf: client.cpf?.replace(/\D/g, '') || undefined,
        cnpj: client.cnpj?.replace(/\D/g, '') || undefined,
        endereco: client.endereco ? {
          ...client.endereco,
          cep: client.endereco.cep?.replace(/\D/g, '') || undefined,
        } : undefined,
      };

      await clientSchema.validate(dataToValidate, { abortEarly: false });

      console.log('Cliente validado e pronto para salvar:', dataToValidate);
      await new Promise(resolve => setTimeout(resolve, 700));

      Toast.show({
        type: 'success',
        text1: isEditMode ? 'Cliente Atualizado' : 'Cliente Cadastrado',
        text2: `${dataToValidate.nome} foi salvo com sucesso!`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.navigate('ClientList');

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        console.error("Erros de validação:", err.errors);
        const firstError = err.errors[0];
        Alert.alert('Erro de Validação', firstError);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        console.error("Erro ao salvar cliente:", err);
        Alert.alert('Erro Inesperado', 'Não foi possível salvar o cliente. Verifique os dados ou tente novamente.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    }
  }, [client, isEditMode, navigation, readOnly]);

  const handleNext = useCallback(() => {
    if (readOnly) return;
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      handleSubmit();
    }
  }, [step, readOnly, handleSubmit]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(s => s - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  const renderStep = useCallback(() => {
    const stepProps = {
        data: client,
        onUpdate: readOnly ? () => {} : updateClient,
        isEditMode: isEditMode, // This prop might be unused in child components now
        readOnly: readOnly,
    };

    switch (step) {
      case 1: return <ClientBasicInfoStep {...stepProps} />;
      case 2: return <ClientDocumentsStep {...stepProps} />;
      case 3: return <ClientAddressStep {...stepProps} />;
      case 4: return <ClientReviewStep data={client} onEditStep={readOnly ? () => {} : handleGoToStep} />; // Removed onUpdate, isEditMode, and readOnly props
      default: return null;
    }
  }, [step, client, updateClient, isEditMode, readOnly, handleGoToStep]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'} // Used isDark
        backgroundColor={theme.colors.background}
      />
      <View style={styles.headerContainer}>
          <BreadcrumbTrail items={breadcrumbs} />
      </View>
      <ProgressIndicator
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        titles={STEP_TITLES}
      />
      <View style={styles.content}>
        {renderStep()}
      </View>
      {!readOnly && (
        <NavigationButtons
            onNext={handleNext}
            onBack={handleBack}
            isFirstStep={step === 1} // Corrected props
            isLastStep={step === TOTAL_STEPS} // Corrected props
            isEditMode={isEditMode} // This prop is used by NavigationButtons
            // nextButtonText is handled internally by NavigationButtons
            // backButtonText is handled internally by NavigationButtons
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default ClientWizardScreen;
