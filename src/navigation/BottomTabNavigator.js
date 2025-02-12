import React from 'react';
import { Icon } from '@rneui/themed';
import HomeStack from './stacks/HomeStack';
import CalendarStack from './stacks/CalendarStack';
import SearchStack from './stacks/SearchStack';
import { Tab, tabConfig } from './navigationConfig';

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
  return (
    <Tab.Navigator
      {...tabConfig}
      screenOptions={({ route }) => ({
        ...tabConfig.screenOptions,
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
