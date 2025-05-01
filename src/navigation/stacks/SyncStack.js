import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../../contexts/ThemeContext";
import SyncExportOptionsScreen from "../../screens/SyncExportOptionsScreen";
import EmailSyncScreen from "../../screens/EmailSyncScreen";
import ExportScreen from "../../screens/ExportScreen";
import FeedbackScreen from "../../screens/FeedbackScreen"; // Nova tela de feedback
import { navigationConfig } from "../navigationConfig";

const Stack = createNativeStackNavigator();

const SyncStack = () => {
  const { theme } = useTheme();

  // Objeto de estilo comum para cabeçalhos
  const commonHeaderTitleStyle = {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
  };

  return (
    <Stack.Navigator
      initialRouteName="SyncExportOptions" // Set the new screen as initial
      screenOptions={{
        ...navigationConfig,
        presentation: "card",
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
      }}
    >
      <Stack.Screen
        name="SyncExportOptions" // Correct screen name
        component={SyncExportOptionsScreen} // Correct component
        options={{
          headerShown: false, // Hide header for this specific screen
        }}
      />
      <Stack.Screen
        name="EmailSync"
        component={EmailSyncScreen}
        options={{
          title: "Sincronizar", // Title for the sync screen
          headerTitleAlign: "center",
          headerTitleStyle: commonHeaderTitleStyle,
        }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{
          title: "Exportar",
          headerTitleAlign: "center",
          headerTitleStyle: commonHeaderTitleStyle,
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          title: "Feedback",
          headerTitleAlign: "center",
          headerTitleStyle: commonHeaderTitleStyle,
        }}
      />
    </Stack.Navigator>
  );
};

export default SyncStack;
