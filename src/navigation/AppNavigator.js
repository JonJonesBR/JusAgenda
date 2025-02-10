import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ErrorBoundary from '../components/ErrorBoundary';

// Importação dinâmica dos componentes das telas (lazy loading)
const HomeScreen = React.lazy(() => import('../screens/HomeScreen'));
const EventDetailsScreen = React.lazy(() =>
  import('../screens/EventDetailsScreen')
);
const AddEventScreen = React.lazy(() => import('../screens/AddEventScreen'));

const Stack = createNativeStackNavigator();

/**
 * Navigator principal da aplicação, encapsulado por um ErrorBoundary e Suspense.
 */
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
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Início' }}
            />
            <Stack.Screen
              name="EventDetails"
              component={EventDetailsScreen}
              options={{ title: 'Detalhes do Evento' }}
            />
            <Stack.Screen
              name="AddEvent"
              component={AddEventScreen}
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
