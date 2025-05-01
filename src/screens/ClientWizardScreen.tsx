import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import BreadcrumbTrail from '../components/navigation/BreadcrumbTrail';

// Passos do wizard para clientes
import ClientBasicInfoStep from '../components/ClientWizard/ClientBasicInfoStep';
import ClientDocumentsStep from '../components/ClientWizard/ClientDocumentsStep';
import ClientAddressStep from '../components/ClientWizard/ClientAddressStep';
import ClientReviewStep from '../components/ClientWizard/ClientReviewStep';
import ProgressIndicator from '../components/EventWizard/ProgressIndicator';
import NavigationButtons from '../components/EventWizard/NavigationButtons';

// Tipo Cliente
export interface Client {
  id: string;
  nome: string;
  nomeFantasia?: string; // Nome fantasia para empresas
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
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
  tipo: 'pessoaFisica' | 'pessoaJuridica';
}

type ClientWizardParams = {
  client?: Client;
  isEditMode?: boolean;
};

type NavigationProp = NativeStackNavigationProp<{
  Home: undefined;
  ClientList: undefined;
}>;

/**
 * Tela de wizard para criação e edição de clientes
 */
const ClientWizardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<{ ClientWizard: ClientWizardParams }, 'ClientWizard'>>();
  const { client: initialClient, isEditMode = false } = route.params ?? {};
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  
  // Inicializar cliente
  const [client, setClient] = useState<Partial<Client>>(
    initialClient || {
      id: Date.now().toString(),
      nome: '',
      tipo: 'pessoaFisica',
    }
  );
  
  // Breadcrumbs para navegação
  const breadcrumbs = [
    { id: 'home', label: 'Início', onPress: () => navigation.navigate('Home') },
    { 
      id: 'clients', 
      label: 'Clientes', 
      onPress: () => navigation.navigate('ClientList') 
    },
    { 
      id: 'wizard', 
      label: isEditMode ? 'Editar Cliente' : 'Novo Cliente' 
    },
  ];
  
  // Total de passos
  const TOTAL_STEPS = 4;
  
  // Atualizar dados do cliente
  const updateClient = useCallback((newData: Partial<Client>) => {
    setClient(prevData => ({...prevData, ...newData}));
    // Feedback tátil leve
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);
  
  // Avançar para o próximo passo
  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      // Validar o passo atual
      let isValid = true;
      
      // Passo 1: Validar informações básicas
      if (step === 1) {
        if (!client.nome) {
          Toast.show({
            type: 'error',
            text1: 'Nome obrigatório',
            text2: 'Por favor, preencha o nome do cliente',
          });
          isValid = false;
        }
      }
      
      // Passo 2: Validar documentos
      if (step === 2 && client.tipo === 'pessoaFisica') {
        // Validação de CPF opcional
        if (client.cpf && client.cpf.replace(/\D/g, '').length !== 11) {
          Toast.show({
            type: 'error',
            text1: 'CPF inválido',
            text2: 'Por favor, verifique o CPF informado',
          });
          isValid = false;
        }
      }
      
      if (isValid) {
        setStep(s => s + 1);
        // Feedback tátil médio para avanço
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else {
        // Feedback tátil de erro
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
    } else {
      // No último passo, fazemos a submissão
      handleSubmit();
    }
  }, [step, client]);
  
  // Voltar para o passo anterior
  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(s => s - 1);
      // Feedback tátil suave para retorno
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      // No primeiro passo, voltamos para a lista de clientes
      navigation.goBack();
    }
  }, [step, navigation]);
  
  // Submeter o formulário
  const handleSubmit = useCallback(() => {
    // Aqui você implementaria a lógica para salvar/atualizar o cliente
    // no banco de dados ou na API
    
    Toast.show({
      type: 'success',
      text1: isEditMode ? 'Cliente atualizado' : 'Cliente cadastrado',
      text2: `${client.nome} foi ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`,
    });
    
    // Feedback tátil de sucesso
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    
    // Navegar de volta para a lista
    setTimeout(() => {
      navigation.navigate('ClientList');
    }, 1000);
  }, [client, isEditMode, navigation]);
  
  // Renderizar o passo atual
  const renderStep = useCallback(() => {
    switch(step) {
      case 1:
        return (
          <ClientBasicInfoStep 
            data={client} 
            onUpdate={updateClient} 
            isEditMode={isEditMode}
          />
        );
      case 2:
        return (
          <ClientDocumentsStep 
            data={client} 
            onUpdate={updateClient}
            isEditMode={isEditMode}
          />
        );
      case 3:
        return (
          <ClientAddressStep 
            data={client} 
            onUpdate={updateClient}
            isEditMode={isEditMode}
          />
        );
      case 4:
        return (
          <ClientReviewStep 
            data={client} 
            onUpdate={updateClient}
            isEditMode={isEditMode}
          />
        );
      default:
        return null;
    }
  }, [step, client, updateClient, isEditMode]);
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      {/* Trilha de navegação */}
      <BreadcrumbTrail items={breadcrumbs} />
      
      {/* Indicador de progresso */}
      <ProgressIndicator 
        currentStep={step} 
        totalSteps={TOTAL_STEPS} 
        titles={['Informações Básicas', 'Documentos', 'Endereço', 'Revisão']}
      />
      
      {/* Conteúdo do passo atual */}
      <View style={styles.content}>
        {renderStep()}
      </View>
      
      {/* Botões de navegação */}
      <NavigationButtons 
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={step === 1}
        isLastStep={step === TOTAL_STEPS}
        isEditMode={isEditMode}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default ClientWizardScreen;
