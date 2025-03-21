import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
import ExportScreen from '../screens/ExportScreen'; // ajuste o caminho conforme sua estrutura
import { Stack, navigationConfig } from './navigationConfig';

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator {...navigationConfig}>
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{ title: 'Exportar Compromissos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
