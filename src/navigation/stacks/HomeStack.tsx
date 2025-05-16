import React from "react";
// import { TextStyle, StyleProp } from "react-native"; // Removido TextStyle, StyleProp
import HomeScreen from "../../screens/HomeScreen";
import EventDetailsScreen from "../../screens/EventDetailsScreen";
import EventViewScreen from "../../screens/EventViewScreen";
import ExportScreen from "../../screens/ExportScreen";
import SettingsScreen from "../../screens/SettingsScreen";
import { Stack, navigationConfig } from "../navigationConfig";
import { useTheme } from "../../contexts/ThemeContext";
import { RouteProp } from '@react-navigation/native'; // Import RouteProp
import { Event } from "../../types/event"; // Importar tipo Event para params

// Definindo tipo para os parâmetros das rotas que os recebem
type HomeStackParamList = {
  HomeScreen: undefined;
  EventView: { eventId: string }; // Exemplo: precisa de ID para buscar o evento
  EventDetails: { event?: Event; editMode?: boolean }; // Recebe evento opcional e modo
  Export: undefined;
  Settings: undefined;
  // Adicione outras telas se necessário
};

/**
 * Stack de navegação principal iniciada na HomeScreen
 */
const HomeStack: React.FC = () => {
  const { theme } = useTheme();

  // Estilo comum para o título do cabeçalho - opcional, pois está em screenOptions
  // const commonHeaderTitleStyle: StyleProp<TextStyle> = {
  //   color: theme.colors.onPrimary || "#FFFFFF",
  // };

  // Configurações padrão para as telas desta stack
  const stackScreenOptions = {
    ...navigationConfig,
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: theme.colors.onPrimary || "#FFFFFF",
    headerTitleStyle: {
      fontWeight: "bold" as const, // 'bold' também funciona
      fontSize: 18,
      color: theme.colors.onPrimary || "#FFFFFF",
    },
    // contentStyle: { // Remover se não for válido
    //   backgroundColor: theme.colors.background,
    // },
  };

  return (
    // Envolver com Provider apenas se necessário especificamente para esta Stack
    <Stack.Navigator
        // initialRouteName="HomeScreen" // Definir rota inicial explicitamente
        screenOptions={stackScreenOptions} // Aplicar opções padrão
    >
      {/* Tela Home */}
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }} // Header customizado na tela
      />
      {/* Tela de Visualização de Evento */}
      <Stack.Screen
        name="EventView"
        component={EventViewScreen}
        options={{
          title: "Detalhes do Compromisso",
          // headerTitleStyle: commonHeaderTitleStyle, // Não necessário se igual ao padrão
        }}
        // Você pode querer buscar o evento aqui baseado em route.params.eventId e
        // passar para o componente ou deixar o componente buscar.
      />
      {/* Tela de Edição/Criação de Evento */}
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={({ route }: { route: RouteProp<HomeStackParamList, 'EventDetails'> }) => {
          const params = route.params; // params are now correctly typed
          const isEdit = params?.editMode;
          const hasEvent = !!params?.event; // Verifica se um evento foi passado (pode ser edição ou visualização inicial)

          let title = "Novo Compromisso"; // Default para criação
          if (hasEvent) {
              title = isEdit ? "Editar Compromisso" : "Detalhes do Compromisso";
          }
          // Se 'isEditMode' for true mas 'event' for undefined (criar novo), mantém "Novo Compromisso"

          return {
            title: title,
            // headerTitleStyle: commonHeaderTitleStyle, // Não necessário se igual ao padrão
            // Considerar adicionar botão Salvar/Cancelar no header para modo edição/criação
            // headerRight: () => (isEdit || !hasEvent ? <Button title="Salvar" onPress={() => { /* Lógica de salvar */ }} /> : null),
            // headerLeft: () => ( ... botão cancelar ...),
          };
        }}
      />
      {/* Tela de Exportação */}
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{
          title: "Exportar Compromissos",
          // headerTitleStyle: commonHeaderTitleStyle, // Não necessário
        }}
      />
      {/* Tela de Configurações */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Configurações",
          // headerTitleStyle: commonHeaderTitleStyle, // Não necessário
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
