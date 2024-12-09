import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import HomeScreen from './src/screens/HomeScreen';
import EventCreateScreen from './src/screens/EventCreateScreen';
import CalendarViewScreen from './src/screens/CalendarViewScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import { configureNotifications } from './src/services/notifications';

const Stack = createStackNavigator();

/**
 * Configurações da pilha de navegação com suporte ao tema.
 */
const AppNavigator = () => {
  const { theme } = useTheme(); // Obtém o tema do contexto
  const currentTheme = theme === 'light' ? { backgroundColor: '#FFFFFF', textColor: '#000000' } : { backgroundColor: '#1A5F7A', textColor: '#FFFFFF' };

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: currentTheme.backgroundColor },
        headerTintColor: currentTheme.textColor,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'JusAgenda' }}
      />
      <Stack.Screen
        name="EventCreate"
        component={EventCreateScreen}
        options={{ title: 'Novo Evento' }}
      />
      <Stack.Screen
        name="CalendarView"
        component={CalendarViewScreen}
        options={{ title: 'Calendário' }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Resultados da Busca' }}
      />
    </Stack.Navigator>
  );
};

/**
 * Componente principal do aplicativo.
 */
const App = () => {
  // Configurar notificações ao iniciar o app
  React.useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
