import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from '@rneui/themed';
import moment from 'moment';
import 'moment/locale/pt-br';

// Importação das telas e contextos
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SearchScreen from './src/screens/SearchScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import { EventProvider } from './src/contexts/EventContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Navegador de pilha para a aba Home.
 */
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6200ee' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ title: 'Detalhes do Evento' }}
    />
  </Stack.Navigator>
);

/**
 * Navegador de pilha para a aba Calendar.
 */
const CalendarStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6200ee' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="CalendarScreen"
      component={CalendarScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ title: 'Detalhes do Evento' }}
    />
  </Stack.Navigator>
);

/**
 * Navegador de pilha para a aba Search.
 */
const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6200ee' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen
      name="SearchScreen"
      component={SearchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={{ title: 'Detalhes do Evento' }}
    />
  </Stack.Navigator>
);

/**
 * Navegador principal com tabs.
 */
const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Calendar':
            iconName = 'calendar-today';
            break;
          case 'Search':
            iconName = 'search';
            break;
          default:
            iconName = 'circle';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#6200ee',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Início' }} />
    <Tab.Screen name="Calendar" component={CalendarStack} options={{ title: 'Agenda' }} />
    <Tab.Screen name="Search" component={SearchStack} options={{ title: 'Buscar' }} />
  </Tab.Navigator>
);

/**
 * Componente principal do app.
 */
const App = () => {
  // Configura o locale do moment para português.
  moment.locale('pt-br');

  return (
    <EventProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </EventProvider>
  );
};

export default App;
