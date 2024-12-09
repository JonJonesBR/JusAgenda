import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import HomeScreen from './src/screens/HomeScreen';
import EventCreateScreen from './src/screens/EventCreateScreen';
import CalendarViewScreen from './src/screens/CalendarViewScreen';
import { configureNotifications } from './src/services/notifications';
import SearchResultsScreen from './src//screens/SearchResultsScreen'; 

const Stack = createStackNavigator();

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
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#1A5F7A' },
              headerTintColor: '#FFFFFF',
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
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
