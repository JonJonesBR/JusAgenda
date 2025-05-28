import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native"; // StyleSheet importado
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EventCrudProvider } from "./src/contexts/EventCrudContext";
import { ThemeProvider } from "./src/contexts/ThemeContext"; // Importado ThemeProvider

// Impede que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

// Define os estilos usando StyleSheet.create
const styles = StyleSheet.create({
  appContainer: { // Movido para cima para ordem alfabética
    flex: 1,
  },
  // devErrorDetails: { // Estilo opcional para detalhes do erro em desenvolvimento
  //   marginTop: 10,
  //   color: 'grey',
  // },
  errorContainer: {
    alignItems: 'center', // 'alignItems' antes de 'justifyContent'
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 10, // 'marginBottom' antes de 'textAlign'
    textAlign: 'center',
  },
  gestureHandlerRoot: { // Mantido após appContainer
    flex: 1,
  },
});

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function prepare(): Promise<void> {
      try {
        // Simula o carregamento de fontes ou outras tarefas de inicialização
        // Ex: await Font.loadAsync({...});
        // await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        const errorInstance = e instanceof Error ? e : new Error('Erro desconhecido durante a inicialização');
        console.error('Error during app initialization:', errorInstance);
        setError(errorInstance);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Não queremos que isso quebre o app, apenas avise
        console.warn('SplashScreen.hideAsync error:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // SplashScreen está visível
  }

  if (error) {
    // Tela de erro básica
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Ocorreu um erro ao inicializar o aplicativo. Por favor, tente novamente.
        </Text>
        {/* Em modo de desenvolvimento, pode ser útil mostrar mais detalhes do erro
        {__DEV__ && <Text style={styles.devErrorDetails}>{error.toString()}</Text>}
        */}
      </View>
    );
  }

  // Estrutura principal do aplicativo
  return (
    <GestureHandlerRootView style={styles.gestureHandlerRoot}>
      <SafeAreaProvider>
        <ThemeProvider>
          <View style={styles.appContainer} onLayout={onLayoutRootView}>
            <EventCrudProvider>
              <NavigationContainer>
                <BottomTabNavigator />
              </NavigationContainer>
            </EventCrudProvider>
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
