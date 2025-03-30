import React, { useMemo } from 'react';
import { Icon } from '@rneui/themed';
import HomeStack from './stacks/HomeStack';
import CalendarStack from './stacks/CalendarStack';
import SearchStack from './stacks/SearchStack';
import SyncStack from './stacks/SyncStack';
import { Tab } from './navigationConfig';
import { useTheme } from '../contexts/ThemeContext';

const BottomTabNavigator = () => {
  const { theme, isDarkMode } = useTheme();

  // Configuração com base no tema atual
  const tabConfig = useMemo(() => ({
    screenOptions: {
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 18,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary || '#757575',
      tabBarStyle: {
        backgroundColor: theme.colors.background,
        paddingBottom: 5,
        height: 60,
        borderTopColor: theme.colors.border,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 5
      }
    }
  }), [theme]);

  /**
   * Retorna o ícone apropriado para cada rota.
   *
   * @param {string} routeName - Nome da rota.
   * @returns {string} Nome do ícone.
   */
  const getTabIcon = (routeName) => {
    switch (routeName) {
      case 'Home':
        return 'home';
      case 'Calendar':
        return 'calendar-today';
      case 'Search':
        return 'search';
       case 'Sync': // Keep internal name 'Sync' for the stack
         return 'settings'; // Change icon
       default:
         return 'circle'; // Default icon
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabConfig.screenOptions,
        tabBarIcon: ({ color, size }) => (
          <Icon 
            type="material" 
            name={getTabIcon(route.name)} 
            size={size} 
            color={color} 
          />
        ),
        headerTitle: route.name === 'Home' ? 'Início' : 
                      route.name === 'Calendar' ? 'Agenda' :
                      route.name === 'Search' ? 'Buscar' :
                      route.name === 'Sync' ? 'Opções' : route.name, // Change header title
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Início' }} />
      <Tab.Screen name="Calendar" component={CalendarStack} options={{ title: 'Agenda' }} />
      <Tab.Screen name="Search" component={SearchStack} options={{ title: 'Buscar' }} />
      <Tab.Screen name="Sync" component={SyncStack} options={{ title: 'Opções' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
