import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Stack, navigationConfig } from "../navigationConfig";
import ClientListScreen from "../../screens/ClientListScreen";
import ClientWizardScreen from "../../screens/ClientWizardScreen";

/**
 * Stack de navegação para a seção de Clientes
 */
const ClientsStack = () => {
  const { theme } = useTheme();

  // Configurações de estilo baseadas no tema atual
  const stackScreenOptions = {
    ...navigationConfig,
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold",
      color: "#fff",
      fontSize: 18,
    },
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
  };

  // Objeto de estilo comum para cabeçalhos
  const commonHeaderTitleStyle = {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
  };

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="ClientList"
        component={ClientListScreen}
        options={{
          title: "Clientes",
          headerTitleStyle: commonHeaderTitleStyle,
        }}
      />
      <Stack.Screen
        name="ClientWizard"
        component={ClientWizardScreen}
        options={({ route }) => ({
          title: route?.params?.isEditMode 
            ? "Editar Cliente" 
            : "Novo Cliente",
          headerTitleStyle: commonHeaderTitleStyle,
          // Escondemos o header porque o wizard tem seu próprio sistema de navegação
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
};

export default ClientsStack;
