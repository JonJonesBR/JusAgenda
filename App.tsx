import 'react-native-gesture-handler'; // Deve ser o primeiro import
import React, { useEffect, useState, useCallback, ReactNode } from 'react';
import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, StyleSheet, Text, View, ActivityIndicator, Button } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Exemplo de fonte de ícone

import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { ThemeProvider, useTheme as useAppTheme } from './src/contexts/ThemeContext'; // Renomeado para evitar conflito
import { EventCrudProvider } from './src/contexts/EventCrudContext';
import { ToastProvider } from './src/components/ui/Toast'; // Supondo que você tenha um ToastProvider

// Manter o splash screen visível enquanto buscamos recursos
SplashScreen.preventAutoHideAsync().catch(e => console.warn('SplashScreen.preventAutoHideAsync error:', e));

interface AppError {
  message: string;
  details?: string;
}

// Função para carregar recursos (fontes, imagens, etc.)
async function loadResourcesAsync(): Promise<void> {
  await Promise.all([
    Asset.loadAsync([
      // Adicione aqui quaisquer imagens que você queira pré-carregar
      // require('./assets/images/my_image.png'),
    ]),
    Font.loadAsync({
      ...MaterialCommunityIcons.font, // Exemplo de carregamento de fonte de ícone
      // Adicione aqui suas fontes personalizadas
      // 'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
    }),
    // Simular um carregamento mais longo para testes de splash screen (remover em produção)
    // new Promise(resolve => setTimeout(resolve, 2000)),
  ]);
}

export default function App(): ReactNode {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    async function prepare(): Promise<void> {
      try {
        console.log('App: Iniciando preparação...');
        await loadResourcesAsync();
        console.log('App: Recursos carregados.');
        // Outras inicializações podem vir aqui (ex: carregar configurações do usuário)
      } catch (e: unknown) {
        console.error('App: Erro durante a inicialização:', e);
        const errorInstance = e instanceof Error ? e : new Error('Erro desconhecido durante a inicialização');
        setError({
          message: 'Falha ao carregar o aplicativo.',
          details: errorInstance.message,
        });
      } finally {
        setAppIsReady(true);
        console.log('App: Preparação finalizada, appIsReady:', true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('App: Layout pronto, escondendo SplashScreen.');
      try {
        await SplashScreen.hideAsync();
        console.log('App: SplashScreen escondido.');
      } catch (e) {
        console.warn('App: SplashScreen.hideAsync error:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady && !error) {
    // Enquanto appIsReady é false e não há erro, o SplashScreen nativo estará visível.
    // Você pode retornar null ou um ActivityIndicator básico aqui se o SplashScreen.preventAutoHideAsync falhar por algum motivo,
    // mas idealmente o preventAutoHideAsync segura a UI.
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        {/* O onLayoutRootView não será chamado aqui, pois o conteúdo principal ainda não está pronto.
            O SplashScreen.hideAsync será chamado no onLayoutRootView do conteúdo principal quando appIsReady for true. */}
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeAreaError} onLayout={onLayoutRootView}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error.message}</Text>
            {error.details && <Text style={styles.errorDetailsText}>Detalhes: {error.details}</Text>}
            {/* Poderia adicionar um botão para tentar novamente, que limpa o erro e re-executa prepare() */}
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Componente interno para acessar o tema e aplicar à NavigationContainer
  const AppNavigation = () => {
    const { theme, isDark } = useAppTheme(); // Hook do seu ThemeContext

    const navigationTheme: NavigationTheme = {
      dark: isDark,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.notification,
      },
    };

    return (
      <NavigationContainer theme={navigationTheme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background} // Cor de fundo da status bar
        />
        <BottomTabNavigator />
      </NavigationContainer>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* onLayoutRootView é crucial aqui para esconder o SplashScreen APÓS o layout do conteúdo principal estar pronto */}
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <ThemeProvider>
            <EventCrudProvider>
              <ToastProvider>
                {/* SafeAreaView pode ser aplicada aqui ou dentro das telas individuais */}
                {/* <SafeAreaView style={{ flex: 1, backgroundColor: appTheme.colors.background }}> */}
                <AppNavigation />
                {/* </SafeAreaView> */}
              </ToastProvider>
            </EventCrudProvider>
          </ThemeProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeAreaError: {
    flex: 1,
    backgroundColor: '#f8d7da', // Cor de fundo para tela de erro
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#721c24', // Cor do título do erro
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#721c24', // Cor do texto do erro
    textAlign: 'center',
    marginBottom: 10,
  },
  errorDetailsText: {
    fontSize: 14,
    color: '#721c24',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FFFFFF', // Pode definir uma cor de fundo se o splash não cobrir
  },
  // Adicione outros estilos globais ou específicos do App.tsx se necessário
});
