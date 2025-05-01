import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer, Theme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { EventProvider } from "./src/contexts/EventContext";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { StatusBar as RNStatusBar, View, ViewStyle } from "react-native";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { defaultTheme } from "./src/theme/defaultTheme";

import { cleanupInvalidEventsInApp, logStoredEvents } from "./src/services/EventService";

// Importamos o prefetchManager e PrefetchResourceType
import { prefetchManager, PrefetchResourceType } from './src/utils/prefetchManager';
// Importamos o provider de dimensões responsivas
import { DimensionProvider } from './src/utils/responsiveUtils';

// Impede que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

const ThemedApp: React.FC = () => {
  const { theme, isDarkMode } = useTheme();

  // Usa o tema padrão como base e aplica as cores do tema atual
  const navigationTheme: Theme = {
    dark: isDarkMode,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: defaultTheme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: defaultTheme.colors.notification,
    },
    // A propriedade 'fonts' não existe no tipo Theme do React Navigation
  };

  return (
    <>
      <RNStatusBar
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

const rootViewStyle: ViewStyle = {
  flex: 1,
};

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Função para preparar recursos do app
    async function prepare(): Promise<void> {
      try {
        // Iniciamos um timer para medir o tempo de inicialização
        const startTime = Date.now();
        
        // O prefetchManager já é inicializado automaticamente quando importado
        // Isso acontece em background e não bloqueia a inicialização
        
        // Forçamos prefetch de dados essenciais com prioridade alta no background
        prefetchManager.forcePrefetch(PrefetchResourceType.EVENTS, { months: 1 })
          .catch(err => console.warn('Erro ao prefetch de eventos:', err));

        // Limpa eventos inválidos uma única vez (operação necessária)
        await cleanupInvalidEventsInApp();

        // Log stored events apenas em ambiente de desenvolvimento
        if (__DEV__) {
          await logStoredEvents();
        }
        
        // Registra o tempo de inicialização para análise de performance
        const initTime = Date.now() - startTime;
        console.log(`App initialization completed in ${initTime}ms`);
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        // Marca o app como pronto para renderização
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        // Esconde a splash screen quando o app estiver pronto
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignora erros ao esconder a splash screen
        console.warn('Erro ao esconder splash screen:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={rootViewStyle}>
      {/* Adicionamos o DimensionProvider para fornecer informações responsivas */}
      <DimensionProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <SafeAreaProvider>
              <View style={rootViewStyle} onLayout={onLayoutRootView}>
                <EventProvider>
                  <ThemedApp />
                </EventProvider>
              </View>
            </SafeAreaProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </DimensionProvider>
    </GestureHandlerRootView>
  );
};

export default App;
