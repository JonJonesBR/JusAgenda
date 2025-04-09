import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { EventProvider } from "./src/contexts/EventContext";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { StatusBar, View } from "react-native";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { cleanupInvalidEventsInApp, logStoredEvents } from "./src/services/EventService";

// Impede que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

// Define um tema padrão completo para a navegação
const AppDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6200ee",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#000000",
    border: "#E0E0E0",
    notification: "#6200ee",
  },
};

const ThemedApp = () => {
  const { theme, isDarkMode } = useTheme();

  // Usa o AppDefaultTheme como base e aplica as cores do tema atual
  const navigationTheme = {
    ...AppDefaultTheme,
    dark: isDarkMode,
    colors: {
      ...AppDefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card || AppDefaultTheme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={
          isDarkMode ? theme.colors.background : theme.colors.primary
        }
        translucent={false}
      />
      <NavigationContainer theme={navigationTheme}>
        <BottomTabNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
};

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Função para preparar recursos do app
    async function prepare() {
      try {
        // Limpa eventos inválidos uma única vez
        await cleanupInvalidEventsInApp();

        // Log stored events for debugging
        await logStoredEvents();

        // Simula carregamento de recursos do app
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Esconde a splash screen quando o app estiver pronto
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ErrorBoundary>
          <SafeAreaProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <EventProvider>
                <ThemedApp />
              </EventProvider>
            </View>
          </SafeAreaProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;
