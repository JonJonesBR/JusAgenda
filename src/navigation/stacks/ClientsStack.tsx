// src/navigation/stacks/ClientsStack.tsx
import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getStackScreenOptions } from '../navigationConfig'; // getStackScreenOptions ainda é de navigationConfig
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../constants';
import { Client as ClientType } from '../../types/client'; // Para tipar params

// Importar as telas que pertencem a esta stack
import ClientListScreen from '../../screens/ClientListScreen';
import ClientWizardScreen from '../../screens/ClientWizardScreen';
// Se houver uma tela de detalhes do cliente separada do wizard (apenas visualização), importe-a também.
// import ClientViewScreen from '../../screens/ClientViewScreen';

// Defina a ParamList para a ClientsStack
// Isto é crucial para a segurança de tipos com React Navigation
export type ClientsStackParamList = {
  [ROUTES.CLIENT_LIST]: undefined; // Tela de lista de clientes não recebe parâmetros diretos ao ser chamada pela tab
  [ROUTES.CLIENT_WIZARD]: {
    clientId?: string; // Para editar ou visualizar um cliente existente
    isEditMode?: boolean; // Define se está em modo de edição
    readOnly?: boolean; // Define se está em modo de apenas leitura
    // clientData?: ClientType; // Opcional: passar o objeto cliente completo para evitar refetch no wizard
  };
  // Exemplo se tivesse uma ClientViewScreen separada:
  // [ROUTES.CLIENT_VIEW]: { clientId: string; clientName?: string };
};

// Criando a instância do Stack Navigator localmente
const Stack = createNativeStackNavigator<ClientsStackParamList>();

const ClientsStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Obtém as opções de ecrã para a stack, baseadas no tema atual
  const stackScreenOptions = getStackScreenOptions(theme);

  return (
    // Tipando o Stack.Navigator com a ClientsStackParamList
    <Stack.Navigator initialRouteName={ROUTES.CLIENT_LIST} screenOptions={stackScreenOptions}>
      <Stack.Screen
        name={ROUTES.CLIENT_LIST}
        component={ClientListScreen}
        options={{
          headerShown: false, // A ClientListScreen pode já ter um Header customizado
          // title: 'Meus Clientes', // Ou obter o título do componente Header interno
        }}
      />
      <Stack.Screen
        name={ROUTES.CLIENT_WIZARD}
        component={ClientWizardScreen}
        options={({ route }) => ({
          // O título será definido dinamicamente dentro de ClientWizardScreen
          // title: route.params?.clientId
          //   ? (route.params?.readOnly ? 'Visualizar Cliente' : 'Editar Cliente')
          //   : 'Novo Cliente',
          presentation: Platform.OS === 'ios' ? 'modal' : 'card', // Modal no iOS
          // headerBackTitle: 'Voltar', // Opcional
        })}
      />
      {/* Se tivesse uma ClientViewScreen separada:
      <Stack.Screen
        name={ROUTES.CLIENT_VIEW}
        component={ClientViewScreen}
        options={({ route }) => ({
          title: route.params?.clientName || 'Detalhes do Cliente',
        })}
      />
      */}
    </Stack.Navigator>
  );
};

export default ClientsStackNavigator;
