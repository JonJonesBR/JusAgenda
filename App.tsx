import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ViewStyle, Text } from "react-native";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EventCrudProvider } from "./src/contexts/EventCrudContext"; // Import EventCrudProvider

// Impede que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

//const rootViewStyle: ViewStyle = {
//  flex: 1,
//};

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function prepare(): Promise<void> {
      try {
        // Inicialização mínima
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Erro desconhecido durante a inicialização');
        console.error('Error during app initialization:', error);
        setError(error);
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
        console.warn('Erro ao esconder splash screen:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (error) {
    return (
      <View style={[{ flex: 1 }, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Ocorreu um erro ao inicializar o aplicativo. Por favor, tente novamente.</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <SafeAreaProvider>
        <View style={[{ flex: 1}]} onLayout={onLayoutRootView}>
          {/* Wrap NavigationContainer with EventCrudProvider */}
          <EventCrudProvider>
            <NavigationContainer>
              <BottomTabNavigator />
            </NavigationContainer>
          </EventCrudProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
