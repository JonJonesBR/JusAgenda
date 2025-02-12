import React from 'react';
import SearchScreen from '../../screens/SearchScreen';
import EventDetailsScreen from '../../screens/EventDetailsScreen';
import EventViewScreen from '../../screens/EventViewScreen';
import { Stack, stackConfig } from '../navigationConfig';

const SearchStack = () => (
  <Stack.Navigator {...stackConfig}>
    <Stack.Screen
      name="SearchScreen"
      component={SearchScreen}
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
  </Stack.Navigator>
);

export default SearchStack; 