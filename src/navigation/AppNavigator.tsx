/**
 * Este arquivo foi substituído pela implementação direta no App.js
 * Mantido apenas como referência para futuras implementações
 * 
 * A navegação principal agora é gerenciada diretamente no App.js usando o BottomTabNavigator
 * e a tela de Exportação foi movida para dentro do SyncStack
 */

import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme,
} from "@react-navigation/native";
import BottomTabNavigator from "./BottomTabNavigator";
import ExportScreen from "../screens/ExportScreen";
import { Stack, navigationConfig } from "./navigationConfig";
import { useTheme } from "../contexts/ThemeContext";
/* import { StackNavigationOptions } from "@react-navigation/stack"; */

const AppNavigator: React.FC = () => {
  const { isDarkMode, theme } = useTheme();

  const customLightTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: (theme.colors as any).card || "#fff",
      text: theme.colors.text,
      border: theme.colors.border,
      notification: (theme.colors as any).notification || "#6200ee",
    },
  };

  const customDarkTheme: Theme = {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: (theme.colors as any).card || "#fff",
      text: theme.colors.text,
      border: theme.colors.border,
      notification: (theme.colors as any).notification || "#6200ee",
    },
  };

  const stackOptions: any = {
    ...navigationConfig,
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold",
      color: "#fff",
      fontSize: 18,
    },
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
  };

  return (
    <NavigationContainer
      theme={isDarkMode ? customDarkTheme : customLightTheme}
    >
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
            title: "Exportar Compromissos",
            headerTitleStyle: {
              fontWeight: "bold",
              color: "#fff",
              fontSize: 18,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
