import React from "react";
// import { TextStyle, StyleProp } from "react-native"; // Removido TextStyle, StyleProp
import { useTheme } from "../../contexts/ThemeContext";
import SearchScreen from "../../screens/SearchScreen";
import EventDetailsScreen from "../../screens/EventDetailsScreen";
import EventViewScreen from "../../screens/EventViewScreen";
import { Stack, navigationConfig } from "../navigationConfig";
import { RouteProp, ParamListBase } from '@react-navigation/native'; // Import RouteProp and ParamListBase
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // Re-add for navigation prop type
import { Event } from "../../types/event"; // Importar tipo Event para params

// Definindo tipo para os parâmetros das rotas
type SearchStackParamList = {
  SearchScreen: undefined;
  EventView: { eventId: string }; // Busca geralmente leva a visualizar um evento existente
  EventDetails: { event: Event; editMode?: boolean }; // Ou editar um evento existente
  // A rota "Novo Evento" a partir da busca é incomum. Se necessária, adicione:
  // NewEventFromSearch: { /* parâmetros iniciais? */ };
};

/**
 * Stack de navegação para a seção de Busca
 */
const SearchStack: React.FC = () => {
  const { theme } = useTheme();

  // Configurações padrão para as telas desta stack
  const stackScreenOptions = {
    ...navigationConfig,
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: "#FFFFFF", // Fallback for onPrimary
    headerTitleStyle: {
      fontWeight: "bold" as const,
      fontSize: 18,
      color: "#FFFFFF", // Fallback for onPrimary
    },
    // contentStyle: { // Remover se não for válido
    //   backgroundColor: theme.colors.background,
    // },
  };

  return (
    <Stack.Navigator
        // initialRouteName="SearchScreen"
        screenOptions={stackScreenOptions}
    >
      {/* Tela de Busca */}
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }} // Assume header/busca customizado na tela
      />
      {/* Tela de Visualização (resultado da busca) */}
      <Stack.Screen
        name="EventView"
        component={EventViewScreen}
        options={{
          title: "Detalhes do Compromisso",
        }}
        // Componente receberá eventId via route.params para buscar/exibir
      />
      {/* Tela de Edição (acessada a partir de EventView ou diretamente da busca?) */}
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={({ route }: { route: RouteProp<ParamListBase, 'EventDetails'>; navigation: NativeStackNavigationProp<SearchStackParamList> }) => { // Destructure only route
          const params = route.params as SearchStackParamList['EventDetails']; // Cast to specific params
          // No contexto da busca, geralmente se edita um evento existente.
          // A lógica de "Novo Evento" aqui pode não fazer sentido.
          // Se for sempre edição a partir daqui:
          const title = params?.event ? "Editar Compromisso" : "Detalhes do Compromisso"; // Fallback ou título de erro
          // Ou se você permitir navegar para detalhes sem edição:
          // const title = params?.editMode ? "Editar Compromisso" : "Detalhes do Compromisso";
          return {
            title: title,
          };
        }}
        // Componente receberá 'event' e opcionalmente 'editMode' via route.params
      />
    </Stack.Navigator>
  );
};

export default SearchStack;
