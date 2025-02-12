import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ErrorBoundary from '../components/ErrorBoundary';
import BottomTabNavigator from './BottomTabNavigator';

const HomeScreen = React.lazy(() => import('../screens/HomeScreen'));
const EventDetailsScreen = React.lazy(() => import('../screens/EventDetailsScreen'));

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Suspense fallback={null}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#6200ee' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            {/* Aqui você pode adicionar telas de autenticação se necessário */}
            {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
            
            {/* BottomTabNavigator como tela principal após login */}
            <Stack.Screen 
              name="Main" 
              component={BottomTabNavigator}
              options={{ headerShown: false }}
            />
            
            {/* Telas que precisam aparecer por cima da navegação em tabs */}
            <Stack.Screen
              name="EventDetails"
              component={EventDetailsScreen}
              options={({ route }) => ({
                title: route?.params?.event ? 'Editar Evento' : 'Novo Evento',
              })}
            />
          </Stack.Navigator>
        </Suspense>
      </NavigationContainer>
    </ErrorBoundary>
  );
}