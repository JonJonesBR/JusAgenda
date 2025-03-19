import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
