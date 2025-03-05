import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
import { Stack, stackConfig } from './navigationConfig';

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator {...stackConfig}>
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
