// src/screens/ClientWizardScreen.tsx
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs para novos clientes

import { useTheme } from '../contexts/ThemeContext';
// import { useClients } from '../contexts/ClientCrudContext'; // Descomente quando tiver
import { Client as ClientType, PessoaFisica, PessoaJuridica, ClientAddress } from '../types/client';
import { ClientsStackParamList } from '../navigation/stacks/ClientsStack'; // Ajuste para a sua Stack Param List
import { Header, ProgressIndicator, NavigationButtons } from '../components/ui'; // ProgressIndicator e NavigationButtons são da UI geral ou do wizard? Assumindo UI geral por agora.
import { Toast } from '../components/ui/Toast';
import { ROUTES, REGEX_PATTERNS } from '../constants';

// Importar os componentes de passo
import ClientBasicInfoStep from '../components/ClientWizard/ClientBasicInfoStep';
// import ClientDocumentsStep from '../components/ClientWizard/ClientDocumentsStep'; // Removido
import ClientAddressStep from '../components/ClientWizard/ClientAddressStep';
import ClientReviewStep from '../components/ClientWizard/ClientReviewStep';
import { formatDate, parseDateString } from '../utils/dateUtils';

// Tipagem para os parâmetros da rota
type ClientWizardScreenRouteProp = RouteProp<ClientsStackParamList, typeof ROUTES.CLIENT_WIZARD>;
// Tipagem para a prop de navegação
type ClientWizardScreenNavigationProp = StackNavigationProp<ClientsStackParamList, typeof ROUTES.CLIENT_WIZARD>;

// Interface para os dados do formulário do assistente de cliente
// Usamos Partial<ClientType> e ajustamos campos como dataNascimento para Date
export interface ClientWizardFormData extends Omit<Partial<ClientType>, 'id' | 'dataNascimento' | 'dataFundacao' | 'enderecos'> {
  tipo: 'pessoaFisica' | 'pessoaJuridica'; // Obrigatório para discriminar
  dataNascimento?: Date | null; // Para o date picker
  dataFundacao?: Date | null; // Para o date picker
  enderecos?: ClientAddress[]; // Array de endereços
  // Adicionar outros campos específicos do formulário se necessário
}

// Valores iniciais para um novo cliente
const getInitialClientFormData = (tipo: 'pessoaFisica' | 'pessoaJuridica' = 'pessoaFisica'): ClientWizardFormData => ({
  tipo: tipo,
  nome: '',
  email: '',
  telefonePrincipal: '',
  enderecos: [{ cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }], // Pelo menos um endereço inicial
  ativo: true,
  // Campos específicos de PF
  cpf: tipo === 'pessoaFisica' ? '' : undefined,
  // Campos específicos de PJ
  cnpj: tipo === 'pessoaJuridica' ? '' : undefined,
  nomeFantasia: tipo === 'pessoaJuridica' ? '' : undefined,
});

// Nomes dos passos para referência
const STEP_NAMES = ['basicInfo', 'address', 'review'] as const; // 'documents' removido
type StepName = typeof STEP_NAMES[number];

// Schema de validação Yup (deve corresponder à estrutura de ClientType após conversão)
// Este schema é complexo devido aos tipos condicionais.
const clientValidationSchema = Yup.object().shape({
  id: Yup.string().optional(),
  tipo: Yup.string().oneOf(['pessoaFisica', 'pessoaJuridica']).required(),
  nome: Yup.string().required('Nome/Razão Social é obrigatório.').min(3, 'Mínimo 3 caracteres.'),
  email: Yup.string().email('Email inválido.').optional().nullable(),
  telefonePrincipal: Yup.string().optional().nullable(),
  dataCadastro: Yup.string().optional().nullable(), // Validar formato YYYY-MM-DD se usado
  observacoes: Yup.string().optional().nullable(),
  avatarUrl: Yup.string().url('URL do avatar inválida.').optional().nullable(),
  ativo: Yup.boolean().optional(),

  // Campos de Pessoa Física
  cpf: Yup.string().when('tipo', {
    is: 'pessoaFisica',
    then: schema => schema.required('CPF é obrigatório.').matches(REGEX_PATTERNS.CPF, 'CPF inválido.'),
    otherwise: schema => schema.optional().nullable().strip(), // strip() remove o campo se não for PF
  }),
  rg: Yup.string().when('tipo', { is: 'pessoaFisica', then: schema => schema.optional().nullable(), otherwise: schema => schema.strip() }),
  dataNascimento: Yup.string().when('tipo', { // Valida a string formatada
    is: 'pessoaFisica',
    then: schema => schema.optional().nullable().matches(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida.'),
    otherwise: schema => schema.strip()
  }),
  estadoCivil: Yup.string().when('tipo', { is: 'pessoaFisica', then: schema => schema.optional().nullable(), otherwise: schema => schema.strip() }),
  profissao: Yup.string().when('tipo', { is: 'pessoaFisica', then: schema => schema.optional().nullable(), otherwise: schema => schema.strip() }),

  // Campos de Pessoa Jurídica
  cnpj: Yup.string().when('tipo', {
    is: 'pessoaJuridica',
    then: schema => schema.required('CNPJ é obrigatório.').matches(REGEX_PATTERNS.CNPJ, 'CNPJ inválido.'),
    otherwise: schema => schema.optional().nullable().strip(),
  }),
  nomeFantasia: Yup.string().when('tipo', { is: 'pessoaJuridica', then: schema => schema.optional().nullable(), otherwise: schema => schema.strip() }),
  inscricaoEstadual: Yup.string().when('tipo', { is: 'pessoaJuridica', then: schema => schema.optional().nullable(), otherwise: schema => schema.strip() }),
  dataFundacao: Yup.string().when('tipo', { // Valida a string formatada
    is: 'pessoaJuridica',
    then: schema => schema.optional().nullable().matches(/^\d{4}-\d{2}-\d{2}$/, 'Data de fundação inválida.'),
    otherwise: schema => schema.strip()
  }),

  // Endereços (validação para cada item do array)
  enderecos: Yup.array().of(
    Yup.object().shape<Record<keyof ClientAddress, Yup.AnySchema>>({
      id: Yup.string().optional(),
      cep: Yup.string().required('CEP é obrigatório.').matches(REGEX_PATTERNS.CEP, 'CEP inválido.'),
      logradouro: Yup.string().required('Logradouro é obrigatório.'),
      numero: Yup.string().required('Número é obrigatório.'),
      complemento: Yup.string().optional().nullable(),
      bairro: Yup.string().required('Bairro é obrigatório.'),
      cidade: Yup.string().required('Cidade é obrigatória.'),
      estado: Yup.string().required('Estado (UF) é obrigatório.').length(2, 'UF deve ter 2 caracteres.'),
      pais: Yup.string().optional().nullable(),
      isPrincipal: Yup.boolean().optional(),
    })
  ).min(1, 'Pelo menos um endereço é necessário.').required(), // Garante que há pelo menos um endereço
});


const ClientWizardScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ClientWizardScreenNavigationProp>();
  const route = useRoute<ClientWizardScreenRouteProp>();

  // Simulação de ClientCrudContext
  // const { getClientById, addClient, updateClient } = useClients();
  const MOCK_DB_CLIENTS: ClientType[] = [...MOCK_CLIENTS_DATA_FOR_WIZARD]; // Use uma cópia do mock
  const getClientById = (id: string): ClientType | undefined => MOCK_DB_CLIENTS.find(c => c.id === id);
  const addClient = async (client: Omit<ClientType, 'id'>): Promise<ClientType> => {
    const newClient = { ...client, id: uuidv4() } as ClientType;
    MOCK_DB_CLIENTS.push(newClient);
    return newClient;
  };
  const updateClient = async (client: ClientType): Promise<ClientType | undefined> => {
    const index = MOCK_DB_CLIENTS.findIndex(c => c.id === client.id);
    if (index > -1) {
      MOCK_DB_CLIENTS[index] = client;
      return client;
    }
    return undefined;
  };
  // Fim da simulação

  const clientIdFromParams = route.params?.clientId;
  const initialReadOnly = route.params?.readOnly || false;
  const initialIsEditMode = route.params?.isEditMode || !!clientIdFromParams;


  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<ClientWizardFormData>(getInitialClientFormData());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({}); // Erros podem ter caminhos aninhados (ex: 'enderecos.0.cep')
  const [isReadOnly, setIsReadOnly] = useState<boolean>(initialReadOnly);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(!!clientIdFromParams);


  useLayoutEffect(() => {
    let title = 'Novo Cliente';
    if (initialIsEditMode && clientIdFromParams) title = 'Editar Cliente';
    if (initialReadOnly && clientIdFromParams) title = 'Visualizar Cliente';
    navigation.setOptions({ headerTitle: title });
  }, [navigation, clientIdFromParams, initialIsEditMode, initialReadOnly]);


  useEffect(() => {
    if (clientIdFromParams) {
      setIsLoadingData(true);
      const clientToEditOrView = getClientById(clientIdFromParams);
      if (clientToEditOrView) {
        setFormData({
          ...clientToEditOrView, // Espalha todos os campos de ClientType
          // Converte datas string para objetos Date para os pickers
          dataNascimento: clientToEditOrView.tipo === 'pessoaFisica' && clientToEditOrView.dataNascimento
            ? parseDateString(clientToEditOrView.dataNascimento)
            : null,
          dataFundacao: clientToEditOrView.tipo === 'pessoaJuridica' && clientToEditOrView.dataFundacao
            ? parseDateString(clientToEditOrView.dataFundacao)
            : null,
          enderecos: clientToEditOrView.enderecos && clientToEditOrView.enderecos.length > 0
            ? clientToEditOrView.enderecos
            : [{ cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }], // Garante pelo menos um endereço
        });
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Cliente não encontrado.' });
        navigation.goBack();
      }
      setIsLoadingData(false);
    } else {
      // Novo cliente, tipo padrão é pessoaFisica
      setFormData(getInitialClientFormData('pessoaFisica'));
      setIsLoadingData(false);
    }
  }, [clientIdFromParams, getClientById, navigation]);


  const handleFieldUpdate = useCallback((field: keyof ClientWizardFormData, value: any) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      // Se mudar o tipo de cliente, limpar campos específicos do outro tipo
      if (field === 'tipo') {
        if (value === 'pessoaFisica') {
          delete newState.cnpj;
          delete newState.nomeFantasia;
          delete newState.inscricaoEstadual;
          delete newState.dataFundacao;
          newState.cpf = newState.cpf || ''; // Garante que o campo exista para PF
        } else if (value === 'pessoaJuridica') {
          delete newState.cpf;
          delete newState.rg;
          delete newState.dataNascimento;
          delete newState.estadoCivil;
          delete newState.profissao;
          newState.cnpj = newState.cnpj || ''; // Garante que o campo exista para PJ
        }
      }
      return newState;
    });
    if (formErrors[field as string]) {
      setFormErrors(prev => ({ ...prev, [field as string]: undefined }));
    }
  }, [formErrors]);

  const handleAddressUpdate = useCallback((index: number, field: keyof ClientAddress, value: string) => {
    setFormData(prev => {
      const newAddresses = [...(prev.enderecos || [])];
      if (newAddresses[index]) {
        newAddresses[index] = { ...newAddresses[index], [field]: value };
      }
      return { ...prev, enderecos: newAddresses };
    });
     if (formErrors[`enderecos.${index}.${field}`]) {
      setFormErrors(prev => ({ ...prev, [`enderecos.${index}.${field}`]: undefined }));
    }
  }, [formErrors]);

  const handleAddAddress = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      enderecos: [...(prev.enderecos || []), { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }],
    }));
  }, []);

  const handleRemoveAddress = useCallback((index: number) => {
    if (formData.enderecos && formData.enderecos.length <= 1) {
      Toast.show({ type: 'info', text1: 'Aviso', text2: 'Pelo menos um endereço é necessário.' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      enderecos: (prev.enderecos || []).filter((_, i) => i !== index),
    }));
  }, [formData.enderecos]);


  const validateStep = async (stepName: StepName): Promise<boolean> => {
    // Define quais campos validar para cada passo.
    // A validação de campos condicionais (CPF/CNPJ) já está no schema principal.
    let fieldsToValidatePaths: string[] = [];
    switch (stepName) {
      case 'basicInfo':
        fieldsToValidatePaths = ['tipo', 'nome', 'email', 'telefonePrincipal', 'ativo'];
        if (formData.tipo === 'pessoaFisica') {
            fieldsToValidatePaths.push('dataNascimento', 'estadoCivil', 'profissao', 'cpf', 'rg');
        } else {
            fieldsToValidatePaths.push('nomeFantasia', 'dataFundacao', 'ramoAtividade', 'cnpj', 'inscricaoEstadual');
        }
        break;
      // case 'documents': // Removido
      //   fieldsToValidatePaths = formData.tipo === 'pessoaFisica' ? ['cpf', 'rg'] : ['cnpj', 'inscricaoEstadual', 'inscricaoMunicipal'];
      //   break;
      case 'address':
        // A validação de endereços é mais complexa, validaremos o array inteiro no final.
        // Para o passo, podemos verificar se pelo menos um CEP foi preenchido, por exemplo.
        // Ou confiar na validação final. Por agora, validação simples.
        if (!formData.enderecos || formData.enderecos.length === 0 || !formData.enderecos[0].cep) {
            setFormErrors({'enderecos.0.cep': 'Pelo menos um endereço com CEP é necessário.'});
            return false;
        }
        fieldsToValidatePaths = ['enderecos']; // O schema validará cada item do array
        break;
      default:
        return true;
    }

    // Prepara os dados para validação (convertendo Date para string)
    const dataToValidate = {
      ...formData,
      dataNascimento: formData.dataNascimento ? formatDate(formData.dataNascimento, 'yyyy-MM-dd') : undefined,
      dataFundacao: formData.dataFundacao ? formatDate(formData.dataFundacao, 'yyyy-MM-dd') : undefined,
    };

    try {
      // Cria um sub-schema para validar apenas os campos do passo atual
      // Isso é um pouco complexo com Yup para validação parcial de um schema condicional.
      // Uma abordagem mais simples é validar tudo e filtrar os erros para o passo atual.
      await clientValidationSchema.validate(dataToValidate, { abortEarly: false, context: { tipo: formData.tipo } });
      // Filtra os erros para mostrar apenas os relevantes para o passo atual
      const currentStepErrors: Partial<Record<string, string>> = {};
      let hasErrorInStep = false;
      // Object.keys(formErrors).forEach(key => { // formErrors ainda não foi setado aqui
      //     if (fieldsToValidatePaths.some(path => key.startsWith(path))) {
      //         currentStepErrors[key] = formErrors[key];
      //         hasErrorInStep = true;
      //     }
      // });
      // setFormErrors(currentStepErrors); // Mostra apenas erros do passo
      // return !hasErrorInStep;
      setFormErrors({}); // Limpa erros se a validação completa (para o estado atual) passar
      return true;

    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const errors: Partial<Record<string, string>> = {};
        let firstErrorMessage = 'Corrija os campos destacados.';
        let firstErrorFound = false;

        err.inner.forEach(error => {
          if (error.path) {
            const path = error.path as string;
            if (!errors[path]) errors[path] = error.message;
            if (!firstErrorFound && fieldsToValidatePaths.some(valPath => path.startsWith(valPath))) {
                firstErrorMessage = error.message;
                firstErrorFound = true;
            }
          }
        });
        setFormErrors(errors);
        Toast.show({ type: 'error', text1: 'Campos Inválidos', text2: firstErrorMessage });
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
        await handleSubmitForm();
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      navigation.goBack(); // Volta para a tela anterior se estiver no primeiro passo
    }
  };

  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    const clientToSubmit: Partial<ClientType> = {
      ...formData,
      id: clientIdFromParams, // Mantém o ID se estiver a editar
      dataNascimento: formData.dataNascimento ? formatDate(formData.dataNascimento, 'yyyy-MM-dd') : undefined,
      dataFundacao: formData.dataFundacao ? formatDate(formData.dataFundacao, 'yyyy-MM-dd') : undefined,
      // Garante que campos específicos do tipo não sejam enviados se o tipo mudou
      ...(formData.tipo === 'pessoaFisica' ? { cpf: formData.cpf } : { cnpj: formData.cnpj, nomeFantasia: formData.nomeFantasia }),
    };
    // Remove campos que não pertencem ao tipo selecionado
    if (formData.tipo === 'pessoaFisica') {
        delete (clientToSubmit as Partial<PessoaJuridica>).cnpj;
        delete (clientToSubmit as Partial<PessoaJuridica>).nomeFantasia;
    } else {
        delete (clientToSubmit as Partial<PessoaFisica>).cpf;
        delete (clientToSubmit as Partial<PessoaFisica>).rg;
    }


    try {
      await clientValidationSchema.validate(clientToSubmit, { abortEarly: false, context: { tipo: formData.tipo } });

      let result;
      if (initialIsEditMode && clientIdFromParams) {
        result = await updateClient(clientToSubmit as ClientType);
        Toast.show({ type: 'success', text1: 'Cliente Atualizado', text2: `"${formData.nome}" foi atualizado.` });
      } else {
        result = await addClient(clientToSubmit as Omit<ClientType, 'id'>);
        Toast.show({ type: 'success', text1: 'Cliente Adicionado', text2: `"${formData.nome}" foi adicionado.` });
      }

      if (result) {
        navigation.goBack();
      } else {
         Toast.show({ type: 'error', text1: 'Erro ao Salvar', text2: 'Não foi possível salvar os dados do cliente.' });
      }

    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const errors: Partial<Record<string, string>> = {};
        err.inner.forEach(error => {
          if (error.path && !errors[error.path]) {
            errors[error.path] = error.message;
          }
        });
        setFormErrors(errors);
        Toast.show({ type: 'error', text1: 'Erro de Validação', text2: 'Verifique os campos do formulário.' });
        // Navegar para o primeiro passo com erro
         for (let i = 0; i < STEP_NAMES.length; i++) {
            const stepName = STEP_NAMES[i];
            const stepFields = getFieldsForStep(stepName, formData.tipo);
            if (stepFields.some(field => errors[field as string] || (field === 'enderecos' && Object.keys(errors).some(eKey => eKey.startsWith('enderecos.'))))) {
                setCurrentStepIndex(i);
                break;
            }
        }
      } else {
        console.error('Erro de submissão do cliente:', err);
        Toast.show({ type: 'error', text1: 'Erro ao Salvar', text2: 'Ocorreu um erro inesperado.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (stepName: StepName, clientType: 'pessoaFisica' | 'pessoaJuridica'): string[] => {
     switch (stepName) {
      case 'basicInfo':
        const basic = ['tipo', 'nome', 'email', 'telefonePrincipal', 'ativo'];
        if (clientType === 'pessoaFisica') {
            return [...basic, 'dataNascimento', 'estadoCivil', 'profissao', 'cpf', 'rg'];
        } else {
            return [...basic, 'nomeFantasia', 'dataFundacao', 'ramoAtividade', 'cnpj', 'inscricaoEstadual'];
        }
      // case 'documents': // Removido
      //   return clientType === 'pessoaFisica' ? ['cpf', 'rg'] : ['cnpj', 'inscricaoEstadual', 'inscricaoMunicipal'];
      case 'address': return ['enderecos']; // O erro pode ser em enderecos.X.campo
      default: return [];
    }
  }


  const renderStepContent = (): React.ReactNode => {
    const stepProps = {
      formData,
      updateField: handleFieldUpdate,
      errors: formErrors as Partial<Record<keyof ClientWizardFormData, string>>, // Ajuste de tipo para erros
      isReadOnly,
      theme,
    };

    switch (STEP_NAMES[currentStepIndex]) {
      case 'basicInfo':
        return <ClientBasicInfoStep {...stepProps} />;
      // case 'documents': // Removido
      //   return <ClientDocumentsStep {...stepProps} />;
      case 'address':
        return (
          <ClientAddressStep
            {...stepProps}
            // @ts-ignore TODO: fix type for errors in ClientAddressStep
            errors={formErrors} // Passa todos os erros, ClientAddressStep filtrará os de endereço
            onAddressUpdate={handleAddressUpdate}
            onAddAddress={handleAddAddress}
            onRemoveAddress={handleRemoveAddress}
          />
        );
      case 'review':
        // Formatar dados para revisão
        const reviewData = {
            ...formData,
            dataNascimento: formData.dataNascimento ? formatDate(formData.dataNascimento, 'dd/MM/yyyy') : undefined,
            dataFundacao: formData.dataFundacao ? formatDate(formData.dataFundacao, 'dd/MM/yyyy') : undefined,
        };
        return <ClientReviewStep formData={reviewData as any} onEditStep={setCurrentStepIndex} isReadOnly={isReadOnly} theme={theme} />;
      default:
        return null;
    }
  };

  if (isLoadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{color: theme.colors.text, marginTop: theme.spacing.md}}>A carregar dados do cliente...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Header
        title={isReadOnly ? 'Visualizar Cliente' : (initialIsEditMode ? 'Editar Cliente' : 'Novo Cliente')}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.wizardContainer}>
        <ProgressIndicator
          currentStep={currentStepIndex +1} // +1 porque currentStepIndex é base 0
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
            isFirstStep={currentStepIndex === 0}
            isLastStep={currentStepIndex === STEP_NAMES.length - 1}
            isLoadingNext={isSubmitting && currentStepIndex === STEP_NAMES.length - 1}
            canGoNext={!isSubmitting}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// Mock de dados para simular getClientById (remover quando usar context real)
const MOCK_CLIENTS_DATA_FOR_WIZARD: ClientType[] = [
  { id: '1', tipo: 'pessoaFisica', nome: 'Ana Silva Mock', cpf: '111.222.333-44', email: 'ana.mock@example.com', telefonePrincipal: '(11) 98888-0000', dataCadastro: '2023-01-10', ativo: true, enderecos: [{id: 'addr1', cep: '01001-000', logradouro: 'Av. Mock', numero: '100', bairro: 'Mockumbi', cidade: 'Mocktown', estado: 'MK', isPrincipal: true}], dataNascimento: '1990-05-15' },
  { id: '2', tipo: 'pessoaJuridica', nome: 'Mock Empresa XYZ Ltda.', cnpj: '12.345.678/0001-00', nomeFantasia: 'XYZ Mock Soluções', email: 'contato@mockxyz.com', telefonePrincipal: '(21) 1234-0000', dataCadastro: '2022-10-10', ativo: true, enderecos: [{id: 'addr2', cep: '20020-000', logradouro: 'Rua Mock Falsa', numero: '200', bairro: 'Centro Mock', cidade: 'Mock City', estado: 'MC', isPrincipal: true}], dataFundacao: '2010-01-20' },
];


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wizardContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stepContentContainer: {
    paddingBottom: 20,
  },
});

export default ClientWizardScreen;
