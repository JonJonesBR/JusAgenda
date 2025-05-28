// src/navigation/stacks/SearchStack.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Stack, getStackScreenOptions } from '../navigationConfig'; // Usando Stack e getStackScreenOptions
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../constants';
import { Event as EventType } from '../../types/event'; // Para tipar params

// Importar as telas que pertencem a esta stack
import SearchScreen from '../../screens/SearchScreen';
import EventDetailsScreen from '../../screens/EventDetailsScreen';
import EventViewScreen from '../../screens/EventViewScreen';

// Defina a ParamList para a SearchStack
// Isto é crucial para a segurança de tipos com React Navigation
export type SearchStackParamList = {
  [ROUTES.SEARCH]: undefined; // Tela de busca não recebe parâmetros diretos ao ser chamada pela tab
  [ROUTES.EVENT_DETAILS]: { eventId?: string; initialDateString?: string }; // Para adicionar/editar evento a partir da busca (ou visualizar se for o mesmo componente)
  [ROUTES.EVENT_VIEW]: { eventId: string; eventTitle?: string; event?: EventType }; // Para visualizar detalhes de um evento encontrado na busca
  // Adicione outras telas que podem ser navegadas a partir da SearchStack
};

const SearchStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Obtém as opções de ecrã para a stack, baseadas no tema atual
  const stackScreenOptions = getStackScreenOptions(theme);

  return (
    // Tipando o Stack.Navigator com a SearchStackParamList
    <Stack.Navigator initialRouteName={ROUTES.SEARCH} screenOptions={stackScreenOptions}>
      <Stack.Screen
        name={ROUTES.SEARCH}
        component={SearchScreen}
        options={{
          headerShown: false, // A SearchScreen pode já ter um Header customizado ou uma barra de busca no header
          // title: 'Buscar Eventos e Clientes', // Ou obter o título do componente Header interno
        }}
      />
      <Stack.Screen
        name={ROUTES.EVENT_DETAILS}
        component={EventDetailsScreen}
        options={({ route }) => ({
          // O título será definido dinamicamente dentro de EventDetailsScreen
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        })}
      />
      <Stack.Screen
        name={ROUTES.EVENT_VIEW}
        component={EventViewScreen}
        options={({ route }) => ({
          // O título será definido dinamicamente dentro de EventViewScreen
          // title: route.params?.eventTitle || 'Detalhes do Evento',
        })}
      />
      {/* Adicionar outras telas aqui, por exemplo, se a busca puder levar a detalhes de clientes:
      <Stack.Screen
        name={ROUTES.CLIENT_WIZARD} // Supondo que CLIENT_WIZARD esteja em ROUTES
        component={ClientWizardScreen}
        options={{ presentation: Platform.OS === 'ios' ? 'modal' : 'card' }}
      />
      */}
    </Stack.Navigator>
  );
};

export default SearchStackNavigator;
