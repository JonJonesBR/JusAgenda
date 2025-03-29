import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import HomeScreen from '../../screens/HomeScreen';
import EventDetailsScreen from '../../screens/EventDetailsScreen';
import EventViewScreen from '../../screens/EventViewScreen';
import ExportScreen from '../../screens/ExportScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import { Stack, navigationConfig } from '../navigationConfig';

const HomeStack = () => {
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

  // Objeto de estilo comum para cabeçalhos
  const commonHeaderTitleStyle = {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18
  };

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventView"
        component={EventViewScreen}
        options={{ 
          title: 'Detalhes do Compromisso',
          headerTitleStyle: commonHeaderTitleStyle
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={({ route }) => ({
          title: route?.params?.event ? 'Editar Evento' : 'Novo Evento',
          headerTitleStyle: commonHeaderTitleStyle
        })}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{ 
          title: 'Exportar Compromissos',
          headerTitleStyle: commonHeaderTitleStyle
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ 
          title: 'Configurações',
          headerTitleStyle: commonHeaderTitleStyle
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
