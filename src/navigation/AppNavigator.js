import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
import ExportScreen from '../screens/ExportScreen'; // ajuste o caminho conforme sua estrutura
import { Stack, navigationConfig } from './navigationConfig';
import { useTheme } from '../contexts/ThemeContext';

const AppNavigator = () => {
  const { isDarkMode, theme } = useTheme();
  
  // Criar temas personalizados com base no tema da aplicação
  const customLightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification
    },
  };
  
  const customDarkTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification
    },
  };

  // Configuração de navegação com cores do tema
  const stackOptions = {
    ...navigationConfig,
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
  };

  return (
    <NavigationContainer theme={isDarkMode ? customDarkTheme : customLightTheme}>
      <Stack.Navigator screenOptions={stackOptions}>
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{ 
            title: 'Exportar Compromissos',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#fff',
              fontSize: 18
            }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
