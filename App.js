import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from '@rneui/themed';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';

const Stack = createNativeStackNavigator();

const theme = {
  lightColors: {
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#ffffff',
    error: '#b00020',
    text: '#000000',
    border: '#e0e0e0',
  },
  darkColors: {
    primary: '#bb86fc',
    secondary: '#03dac6',
    background: '#121212',
    error: '#cf6679',
    text: '#ffffff',
    border: '#2d2d2d',
  },
  mode: 'light',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar backgroundColor="#6200ee" barStyle="light-content" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#6200ee',
              },
              headerTintColor: '#ffffff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EventDetails"
              component={EventDetailsScreen}
              options={{ title: 'Detalhes do Evento' }}
            />
            <Stack.Screen
              name="SearchResults"
              component={SearchResultsScreen}
              options={{ title: 'Resultados da Busca' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
