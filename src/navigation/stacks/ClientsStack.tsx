import React from "react";
// TextStyle, StyleProp removed as commonHeaderTitleStyle will be removed
import { useTheme } from "../../contexts/ThemeContext";
import { Stack, navigationConfig } from "../navigationConfig"; // Assumindo que Stack e navigationConfig estão corretos
import ClientListScreen from "../../screens/ClientListScreen";
import ClientWizardScreen from "../../screens/ClientWizardScreen";
import { RouteProp } from '@react-navigation/native'; // Import RouteProp
// import { EventCrudProvider } from "../../contexts/EventCrudContext"; // REMOVIDO - Não usado aqui

// Definindo tipo para os parâmetros da rota (se aplicável, para ClientWizard)
// Se ClientWizardScreen espera params, defina-os aqui
type ClientsStackParamList = {
  ClientList: undefined; // Sem parâmetros
  ClientWizard: { clientId?: string; isEditMode?: boolean } | undefined; // Parâmetros opcionais
};

/**
 * Stack de navegação para a seção de Clientes
 */
const ClientsStack: React.FC = () => {
  const { theme } = useTheme();

  // commonHeaderTitleStyle removed as it was unused

  // Configurações padrão para as telas desta stack
  const stackScreenOptions = {
    ...navigationConfig, // Importa configurações base (animações, etc.)
    headerStyle: {
      backgroundColor: theme.colors.primary, // Cor de fundo do header
    },
    headerTintColor: "#FFFFFF", // Cor dos botões/ícones do header (ex: botão voltar)
    headerTitleStyle: {
        fontWeight: "bold" as const, // Ou apenas "bold"
        fontSize: 18,
        color: "#FFFFFF", // Cor do título
    },
    // contentStyle não é uma opção padrão do Native Stack Navigator,
    // talvez você queira estilizar o container da tela no próprio componente da tela
    // ou usar cardStyleInterpolator/screenStyle se disponível na sua versão/tipo de Stack.
    // Para cor de fundo geral, pode ser definido no tema do NavigationContainer.
    // Se for Native Stack:
    // presentation: 'card', // ou 'modal', etc.
  };


  return (
    // Envolver com Provider apenas se necessário especificamente para esta Stack
    <Stack.Navigator
        // Tipagem do Navigator (opcional mas recomendado)
        // initialRouteName="ClientList" // Definir rota inicial explicitamente
        screenOptions={stackScreenOptions} // Aplicar opções padrão a todas as telas
    >
      {/* Tela da Lista de Clientes */}
      <Stack.Screen
        name="ClientList"
        component={ClientListScreen}
        options={{
          title: "Clientes",
          // Não precisa repetir headerTitleStyle se já estiver em stackScreenOptions
          // headerTitleStyle: commonHeaderTitleStyle,
        }}
      />
      {/* Tela do Wizard de Cliente */}
      <Stack.Screen
        name="ClientWizard"
        component={ClientWizardScreen}
        // Tipando 'route' para acessar params com segurança
        options={({ route }: { route: RouteProp<ClientsStackParamList, 'ClientWizard'> }) => {
            const params = route.params; // params are now correctly typed
            return {
                // O título definido aqui não será visível devido a headerShown: false,
                // mas pode ser útil para ferramentas de desenvolvimento ou acessibilidade.
                title: params?.isEditMode
                  ? "Editar Cliente"
                  : "Novo Cliente",
                // Escondemos o header padrão porque o wizard tem seu próprio sistema de navegação/header.
                headerShown: false,
          };
        }}
      />
    </Stack.Navigator>
  );
};

export default ClientsStack;
