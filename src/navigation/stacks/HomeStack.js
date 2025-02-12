import React from 'react';
import HomeScreen from '../../screens/HomeScreen';
import EventDetailsScreen from '../../screens/EventDetailsScreen';
import EventViewScreen from '../../screens/EventViewScreen';
import ExportScreen from '../../screens/ExportScreen';
import { Stack, stackConfig } from '../navigationConfig';

const HomeStack = () => (
  <Stack.Navigator {...stackConfig}>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EventView"
      component={EventViewScreen}
      options={{ title: 'Detalhes do Compromisso' }}
    />
    <Stack.Screen
      name="EventDetails"
      component={EventDetailsScreen}
      options={({ route }) => ({
        title: route?.params?.event ? 'Editar Evento' : 'Novo Evento',
      })}
    />
    <Stack.Screen
      name="Export"
      component={ExportScreen}
      options={{ title: 'Exportar Compromissos' }}
    />
  </Stack.Navigator>
);

export default HomeStack; 