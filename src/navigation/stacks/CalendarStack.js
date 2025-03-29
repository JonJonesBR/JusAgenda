import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import CalendarScreen from '../../screens/CalendarScreen';
import EventDetailsScreen from '../../screens/EventDetailsScreen';
import EventViewScreen from '../../screens/EventViewScreen';
import { Stack, navigationConfig } from '../navigationConfig';

const CalendarStack = () => {
  const { theme } = useTheme();
  
  // Configurações de estilo baseadas no tema atual
  const stackScreenOptions = {
    ...navigationConfig,
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      color: '#fff',
      fontSize: 18
    },
    contentStyle: {
      backgroundColor: theme.colors.background,
    }
  };

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="CalendarScreen"
        component={CalendarScreen}
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
};

export default CalendarStack;
