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
  // DarkTheme, // Removido, pois não está sendo usado
  Theme,
} from "@react-navigation/native";
import BottomTabNavigator from "./BottomTabNavigator";
import ExportScreen from "../screens/ExportScreen";
import { Stack, navigationConfig } from "./navigationConfig";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack"; // Changed to native-stack

const AppNavigator: React.FC = () => {
  // const { isDarkMode, theme } = useTheme();

  const customLightTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: '#6200ee',
      background: '#fff',
      card: '#fff',
      text: '#222',
      border: '#e0e0e0',
      notification: '#6200ee',
    },
  };

  // const customDarkTheme: Theme = { // Removido, pois não está sendo usado
  //   ...DarkTheme,
  //   dark: true,
  //   colors: {
  //     ...DarkTheme.colors,
  //     primary: '#6200ee',
  //     background: '#222',
  //     card: '#222',
  //     text: '#fff',
  //     border: '#757575',
  //     notification: '#6200ee',
  //   },
  // };

  const stackOptions: NativeStackNavigationOptions = {
    ...navigationConfig,
    headerStyle: {
      backgroundColor: '#6200ee',
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold",
      color: "#fff",
      fontSize: 18,
    },
    contentStyle: {
      backgroundColor: '#fff',
    },
  };

  return (
    <NavigationContainer
      theme={customLightTheme}
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
