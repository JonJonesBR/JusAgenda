import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Alert, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import BreadcrumbTrail from '../navigation/BreadcrumbTrail';
import * as yup from 'yup';

import { Client, ClientAddress } from '../types/client';

import ClientBasicInfoStep from '../components/ClientWizard/ClientBasicInfoStep';
import ClientDocumentsStep from '../components/ClientWizard/ClientDocumentsStep';
import ClientAddressStep from '../components/ClientWizard/ClientAddressStep';
import ClientReviewStep from '../components/ClientWizard/ClientReviewStep';
import ProgressIndicator from '../components/EventWizard/ProgressIndicator';
import NavigationButtons from '../components/EventWizard/NavigationButtons';

type ClientStackParamList = {
  Home: undefined;
  ClientList: undefined;
  ClientWizard: { client?: Partial<Client>; isEditMode?: boolean; readOnly?: boolean };
};

type NavigationPropType = NativeStackNavigationProp<ClientStackParamList, 'ClientWizard'>;
type ClientWizardRoutePropType = RouteProp<ClientStackParamList, 'ClientWizard'>;

const clientSchema = yup.object().shape({
  tipo: yup.string().oneOf(['pessoaFisica', 'pessoaJuridica'], 'Tipo de cliente inválido').required('Tipo de cliente obrigatório'),
  nome: yup.string().trim().required('Nome ou Razão Social obrigatório'),
  nomeFantasia: yup.string().trim().when('tipo', {
    is: 'pessoaJuridica',
    then: (schema) => schema.required('Nome Fantasia é obrigatório para Pessoa Jurídica'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  email: yup.string().email('E-mail inválido').trim().nullable().optional(),
  telefone: yup.string().trim().nullable().optional(),
  cpf: yup.string().when('tipo', {
    is: 'pessoaFisica',
    then: (schema) => schema
      .transform(value => (value ? String(value).replace(/\D/g, '') : value))
      .required('CPF obrigatório para Pessoa Física')
      .matches(/^\d{11}$/, 'CPF inválido. Deve conter 11 dígitos.'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  rg: yup.string().trim().nullable().optional(),
  orgaoEmissor: yup.string().trim().nullable().optional(),
  estadoCivil: yup.string().trim().nullable().optional(),
  profissao: yup.string().trim().nullable().optional(),
  dataNascimento: yup.string().trim().nullable().optional(),
  cnpj: yup.string().when('tipo', {
    is: 'pessoaJuridica',
    then: (schema) => schema
      .transform(value => (value ? String(value).replace(/\D/g, '') : value))
      .required('CNPJ obrigatório para Pessoa Jurídica')
      .matches(/^\d{14}$/, 'CNPJ inválido. Deve conter 14 dígitos.'),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  inscricaoEstadual: yup.string().trim().nullable().optional(),
  inscricaoMunicipal: yup.string().trim().nullable().optional(),
  ramoAtividade: yup.string().trim().nullable().optional(),
  responsavelLegal: yup.string().trim().nullable().optional(),
  endereco: yup.object().shape({
    cep: yup.string().trim().nullable().optional()
        .transform(value => (value ? String(value).replace(/\D/g, '') : value))
        .matches(/^\d{8}$/, 'CEP inválido. Deve conter 8 dígitos.'),
    logradouro: yup.string().trim().nullable().optional(),
    numero: yup.string().trim().nullable().optional(),
    complemento: yup.string().trim().nullable().optional(),
    bairro: yup.string().trim().nullable().optional(),
    cidade: yup.string().trim().nullable().optional(),
    estado: yup.string().trim().nullable().optional().max(2, 'UF inválida. Use a sigla com 2 letras.'),
  }).nullable().optional(),
  observacoes: yup.string().trim().nullable().optional(),
  pontoReferencia: yup.string().trim().nullable().optional(),
  documentosAdicionais: yup.string().trim().nullable().optional(),
  id: yup.string().required('ID do cliente é obrigatório'),
});


const ClientWizardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const route = useRoute<ClientWizardRoutePropType>();
  const { client: initialClientData, isEditMode = false, readOnly = false } = route.params ?? {};
  const { theme, isDark } = useTheme();
  const [step, setStep] = useState(1);

  const [client, setClient] = useState<Partial<Client>>(() => {
    const defaultAddress: ClientAddress = {
      logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
    };
    const baseClientData = initialClientData || {
      id: Date.now().toString(),
      nome: '',
      tipo: 'pessoaFisica',
      email: '',
      telefone: '',
      observacoes: '',
      pontoReferencia: '',
      documentosAdicionais: '',
    };
    return {
      ...baseClientData,
      endereco: {
        ...defaultAddress,
        ...(initialClientData?.endereco || {}),
      },
    };
  });

  useEffect(() => {
    if (initialClientData && initialClientData.id !== client.id) {
      const defaultAddress: ClientAddress = {
        logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
      };
      setClient({
        ...initialClientData,
        endereco: {
          ...defaultAddress,
          ...(initialClientData.endereco || {}),
        },
      });
      setStep(1);
    }
  }, [initialClientData, client.id]);

  const breadcrumbs = [
    { id: 'home', label: 'Início', onPress: () => navigation.navigate('Home') },
    { id: 'clients', label: 'Clientes', onPress: () => navigation.navigate('ClientList') },
    { id: 'wizard', label: readOnly ? 'Visualizar Cliente' : (client.id && isEditMode ? 'Editar Cliente' : 'Novo Cliente') },
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
    Keyboard.dismiss();
    if (readOnly) {
        navigation.goBack();
        return;
    }
    try {
      const dataToValidate: Client = {
        id: client.id || Date.now().toString(),
        nome: client.nome || '',
        tipo: client.tipo || 'pessoaFisica',
        email: client.email || undefined,
        telefone: client.telefone || undefined,
        cpf: client.cpf || undefined,
        rg: client.rg || undefined,
        orgaoEmissor: client.orgaoEmissor || undefined,
        estadoCivil: client.estadoCivil || undefined,
        profissao: client.profissao || undefined,
        dataNascimento: client.dataNascimento || undefined,
        nomeFantasia: client.tipo === 'pessoaJuridica' ? (client.nomeFantasia || '') : undefined,
        cnpj: client.cnpj || undefined,
        inscricaoEstadual: client.inscricaoEstadual || undefined,
        inscricaoMunicipal: client.inscricaoMunicipal || undefined,
        ramoAtividade: client.ramoAtividade || undefined,
        responsavelLegal: client.responsavelLegal || undefined,
        endereco: client.endereco || undefined,
        observacoes: client.observacoes || undefined,
        pontoReferencia: client.pontoReferencia || undefined,
        documentosAdicionais: client.documentosAdicionais || undefined,
      };

      await clientSchema.validate(dataToValidate, { abortEarly: false });
      console.log('Cliente validado e pronto para salvar:', dataToValidate);
      await new Promise(resolve => setTimeout(resolve, 700));

      Toast.show({
        type: 'success',
        text1: client.id && isEditMode ? 'Cliente Atualizado' : 'Cliente Cadastrado',
        text2: `${dataToValidate.nome} foi salvo com sucesso!`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.navigate('ClientList');

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        console.error("Erros de validação:", err.errors);
        const firstError = err.errors[0];
        Alert.alert('Erro de Validação', firstError || 'Verifique os campos destacados.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else {
        console.error("Erro ao salvar cliente:", err);
        Alert.alert('Erro Inesperado', 'Não foi possível salvar o cliente. Verifique os dados ou tente novamente.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    }
  }, [client, isEditMode, navigation, readOnly]);

  const handleNext = useCallback(() => {
    Keyboard.dismiss();
    if (readOnly) {
        if (step < TOTAL_STEPS) setStep(s => s + 1);
        else navigation.goBack();
        return;
    }
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      handleSubmit();
    }
  }, [step, handleSubmit, readOnly, navigation]);

  const handleBack = useCallback(() => {
    Keyboard.dismiss();
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
        isEditMode: isEditMode,
        readOnly: readOnly,
    };
    switch (step) {
      case 1: return <ClientBasicInfoStep {...stepProps} />;
      case 2: return <ClientDocumentsStep {...stepProps} />;
      case 3: return <ClientAddressStep {...stepProps} />;
      case 4: return <ClientReviewStep data={client} onEditStep={readOnly ? () => {} : handleGoToStep} />;
      default: return null;
    }
  }, [step, client, updateClient, isEditMode, readOnly, handleGoToStep]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['bottom', 'left', 'right']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
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
        <View style={[styles.navigationButtonContainer, { borderTopColor: theme.colors.border }]}>
            <NavigationButtons
                onNext={handleNext}
                onBack={handleBack}
                isFirstStep={step === 1}
                isLastStep={step === TOTAL_STEPS}
                isEditMode={client.id && isEditMode}
            />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: { // 'content' antes de 'headerContainer'
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  navigationButtonContainer: { // Ordem das propriedades corrigida
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor é aplicado dinamicamente acima usando theme.colors.border
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
});

export default ClientWizardScreen;
