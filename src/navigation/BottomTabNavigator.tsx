// src/navigation/BottomTabNavigator.tsx
import React, { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigatorScreenParams } from '@react-navigation/native'; // Para tipos de params de stacks aninhadas

// Usando o Tab, getTabScreenOptions e getStackScreenOptions de navigationConfig
import { Tab, getTabScreenOptions, getStackScreenOptions } from './navigationConfig';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES } from '../constants';

// Importar os seus Stacks de Navegação para cada aba
import HomeStackNavigator, { HomeStackParamList } from './stacks/HomeStack';
import ClientsStackNavigator, { ClientsStackParamList } from './stacks/ClientsStack';
import SearchStackNavigator, { SearchStackParamList } from './stacks/SearchStack';
// SyncStackNavigator import removed

// Importar telas diretas (se houver alguma que não esteja numa stack)
import UnifiedCalendarScreen from '../screens/UnifiedCalendarScreen';
import SettingsScreen from '../screens/SettingsScreen'; // Exemplo, se Settings for uma tab direta

// Defina a ParamList para o seu BottomTabNavigator
// Isto é crucial para a segurança de tipos com React Navigation
export type BottomTabParamList = {
  [ROUTES.HOME_STACK]: NavigatorScreenParams<HomeStackParamList>; // Stack de Início aninhada
  [ROUTES.CLIENTS_STACK]: NavigatorScreenParams<ClientsStackParamList>; // Stack de Clientes aninhada
  [ROUTES.UNIFIED_CALENDAR]: undefined; // Tela de Calendário Unificado (exemplo de tela direta)
  [ROUTES.SEARCH_STACK]: NavigatorScreenParams<SearchStackParamList>; // Stack de Busca aninhada
  // SYNC_STACK route removed
  // [ROUTES.SETTINGS]: undefined; // Exemplo se Settings fosse uma tab direta
};

// Interface para as props de ícone de aba
interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const BottomTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Obtém as opções de ecrã para as abas, baseadas no tema atual
  // Memoizado para evitar recálculos desnecessários se o tema não mudar
  const memoizedTabScreenOptions = useMemo(() => getTabScreenOptions(theme), [theme]);

  // Função para gerar o ícone da aba
  const getTabBarIcon = (routeName: keyof BottomTabParamList) => ({ focused, color, size }: TabBarIconProps) => {
    let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home'; // Ícone padrão

    switch (routeName) {
      case ROUTES.HOME_STACK:
        iconName = focused ? 'home-variant' : 'home-variant-outline';
        break;
      case ROUTES.CLIENTS_STACK:
        iconName = focused ? 'account-group' : 'account-group-outline';
        break;
      case ROUTES.UNIFIED_CALENDAR:
        iconName = focused ? 'calendar-month' : 'calendar-month-outline';
        break;
      case ROUTES.SEARCH_STACK:
        iconName = focused ? 'magnify' : 'magnify'; // Pode usar o mesmo ou variações
        break;
      // SYNC_STACK case removed
      // case ROUTES.SETTINGS:
      //   iconName = focused ? 'cog' : 'cog-outline';
      //   break;
    }
    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
  };

  return (
    // Tipando o Tab.Navigator com a BottomTabParamList
    <Tab.Navigator
      screenOptions={memoizedTabScreenOptions}
      // initialRouteName={ROUTES.HOME_STACK} // Opcional: definir a aba inicial
    >
      <Tab.Screen
        name={ROUTES.HOME_STACK}
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: getTabBarIcon(ROUTES.HOME_STACK),
          // tabBarBadge: 3, // Exemplo de badge
        }}
      />
      <Tab.Screen
        name={ROUTES.CLIENTS_STACK}
        component={ClientsStackNavigator}
        options={{
          tabBarLabel: 'Clientes',
          tabBarIcon: getTabBarIcon(ROUTES.CLIENTS_STACK),
        }}
      />
      <Tab.Screen
        name={ROUTES.UNIFIED_CALENDAR}
        component={UnifiedCalendarScreen} // Tela direta, não uma stack
        options={{
          tabBarLabel: 'Calendário',
          tabBarIcon: getTabBarIcon(ROUTES.UNIFIED_CALENDAR),
          // Se esta tela precisar do seu próprio header, configure aqui ou no componente da tela
           headerShown: true, // Mostra o header para esta tela de tab direta
           ...(getStackScreenOptions(theme)), // Aplica estilos de header da stack
           title: 'Calendário Unificado', // Título do header para esta tab
        }}
      />
      <Tab.Screen
        name={ROUTES.SEARCH_STACK}
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Busca',
          tabBarIcon: getTabBarIcon(ROUTES.SEARCH_STACK),
        }}
      />
      {/* SYNC_STACK Tab.Screen removed */}
      {/* Exemplo de uma tab direta para Configurações, se não estiver numa stack
      <Tab.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: getTabBarIcon(ROUTES.SETTINGS),
          headerShown: true, // Se precisar de header
          ...(getStackScreenOptions(theme)),
          title: 'Configurações',
        }}
      />
      */}
    </Tab.Navigator>
  );
};

export default React.memo(BottomTabNavigator); // Envolve com React.memo para otimização
