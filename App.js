import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import EventCreateScreen from './src/screens/EventCreateScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import CalendarViewScreen from './src/screens/CalendarViewScreen';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

// Configuração do navegador de pilha
const Stack = createStackNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false, // Remover cabeçalhos padrão
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="EventCreate" component={EventCreateScreen} />
            <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
            <Stack.Screen name="CalendarView" component={CalendarViewScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
