import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import EmailSyncScreen from '../../screens/EmailSyncScreen';
import { navigationConfig } from '../navigationConfig';

const Stack = createNativeStackNavigator();

const SyncStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="EmailSync"
      screenOptions={{
        ...navigationConfig,
        presentation: 'card',
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#fff',
          fontSize: 18
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        }
      }}
    >
      <Stack.Screen
        name="EmailSync"
        component={EmailSyncScreen}
        options={{
          title: 'Sincronização',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export default SyncStack; 