// src/navigation/stacks/HomeStack.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Stack, getStackScreenOptions } from '../navigationConfig'; // Usando Stack e getStackScreenOptions
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../constants';

// Importar as telas que pertencem a esta stack
import HomeScreen from '../../screens/HomeScreen';
import EventDetailsScreen from '../../screens/EventDetailsScreen';
import EventViewScreen from '../../screens/EventViewScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import ClientWizardScreen from '../../screens/ClientWizardScreen'; // Adicionando ClientWizard se acessível daqui
import { Event as EventType } from '../../types/event'; // Para tipar params
import { Client as ClientType } from '../../types/client'; // Para tipar params

// Defina a ParamList para a HomeStack
// Isto é crucial para a segurança de tipos com React Navigation
export type HomeStackParamList = {
  [ROUTES.HOME]: undefined; // Tela inicial não recebe parâmetros diretos ao ser chamada pela tab
  [ROUTES.EVENT_DETAILS]: { eventId?: string; initialDateString?: string }; // Para adicionar/editar evento
  [ROUTES.EVENT_VIEW]: { eventId: string; eventTitle?: string; event?: EventType }; // Para visualizar evento
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.CLIENT_WIZARD]: { // Se ClientWizard for acessível a partir da HomeStack
    clientId?: string;
    isEditMode?: boolean;
    readOnly?: boolean;
    // clientData?: ClientType; // Opcional, se passar o objeto cliente completo
  };
  // Adicione outras telas que podem ser navegadas a partir da HomeStack
};

const HomeStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Obtém as opções de ecrã para a stack, baseadas no tema atual
  const stackScreenOptions = getStackScreenOptions(theme);

  return (
    // Tipando o Stack.Navigator com a HomeStackParamList
    <Stack.Navigator initialRouteName={ROUTES.HOME} screenOptions={stackScreenOptions}>
      <Stack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{
          headerShown: false, // A HomeScreen pode já ter um Header customizado ou não precisar de um da stack
          // title: 'JusAgenda Início', // Ou obter o título do componente Header interno
        }}
      />
      <Stack.Screen
        name={ROUTES.EVENT_DETAILS}
        component={EventDetailsScreen}
        options={({ route }) => ({
          // O título será definido dinamicamente dentro de EventDetailsScreen (Novo/Editar Evento)
          // title: route.params?.eventId ? 'Editar Evento' : 'Novo Evento',
          presentation: Platform.OS === 'ios' ? 'modal' : 'card', // Modal no iOS para adicionar/editar
          // headerBackTitle: 'Cancelar', // Exemplo
        })}
      />
      <Stack.Screen
        name={ROUTES.EVENT_VIEW}
        component={EventViewScreen}
        options={({ route }) => ({
          // O título será definido dinamicamente dentro de EventViewScreen com base no evento
          // title: route.params?.eventTitle || 'Detalhes do Evento',
          presentation: 'card',
        })}
      />
      <Stack.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }}
      />
      {/* Exemplo de como ClientWizardScreen poderia ser incluído se acessível daqui */}
      {/* <Stack.Screen
        name={ROUTES.CLIENT_WIZARD}
        component={ClientWizardScreen}
        options={{
          // O título será definido dinamicamente dentro de ClientWizardScreen
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }}
      /> */}
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
