import React, { useMemo } from 'react';
import { Icon } from '@rneui/themed';
import HomeStack from './stacks/HomeStack';
import CalendarStack from './stacks/CalendarStack';
import SearchStack from './stacks/SearchStack';
import { Tab, navigationConfig } from './navigationConfig';

const tabConfig = {
  screenOptions: {
    ...navigationConfig,
    tabBarActiveTintColor: navigationConfig.tabBarOptions.activeTintColor,
    tabBarInactiveTintColor: navigationConfig.tabBarOptions.inactiveTintColor,
    tabBarStyle: navigationConfig.tabBarOptions.style,
    tabBarLabelStyle: navigationConfig.tabBarOptions.labelStyle
  }
};

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
    default:
      return 'circle';
  }
};

const BottomTabNavigator = () => {
  // Memoiza as configurações de screenOptions para otimizar renderizações
  const screenOptions = useMemo(
    () => ({
      ...tabConfig.screenOptions,
      tabBarIcon: ({ color, size }, route) => (
        <Icon name={getTabIcon(route.name)} size={size} color={color} />
      ),
    }),
    []
  );

  return (
    <Tab.Navigator
      {...tabConfig}
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ color, size }) => (
          <Icon name={getTabIcon(route.name)} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Início' }} />
      <Tab.Screen name="Calendar" component={CalendarStack} options={{ title: 'Agenda' }} />
      <Tab.Screen name="Search" component={SearchStack} options={{ title: 'Buscar' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
