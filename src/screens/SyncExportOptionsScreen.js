import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Icon, Card } from "@rneui/themed"; // Import Card
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";

const SyncExportOptionsScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // justifyContent: 'center', // Remove center alignment to place title at top
      alignItems: "center",
      padding: 20,
      paddingTop: 40, // Add padding top
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 30, // Add margin below title
      textAlign: "center",
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      paddingVertical: 25, // Increase padding
      paddingHorizontal: 25, // Increase padding
      borderRadius: 15, // Increase border radius
      marginBottom: 25, // Increase margin
      width: "95%", // Adjust width
      elevation: 4, // Increase elevation
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 }, // Adjust shadow
      shadowOpacity: 0.15, // Adjust shadow
      shadowRadius: 5, // Adjust shadow
      borderColor: theme.colors.border,
      borderWidth: StyleSheet.hairlineWidth, // Use hairline width
    },
    optionIcon: {
      marginRight: 20, // Increase margin
    },
    optionText: {
      fontSize: 18, // Keep font size
      fontWeight: "600", // Adjust font weight
      color: theme.colors.text,
      flex: 1, // Allow text to wrap and fill available space
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Dados</Text>
      {/* Add screen title */}
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate("EmailSync")}
        activeOpacity={0.7} // Add feedback on press
      >
        <Icon
          name="sync"
          type="material"
          size={28}
          color={theme.colors.primary}
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Sincronizar Compromissos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate("Export")}
        activeOpacity={0.7} // Add feedback on press
      >
        <Icon
          name="file-download"
          type="material"
          size={28}
          color={theme.colors.primary}
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Exportar Compromissos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate("Feedback")}
        activeOpacity={0.7}
        accessibilityLabel="Enviar Feedback"
      >
        <Icon
          name="feedback"
          type="material"
          size={28}
          color={theme.colors.primary}
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Enviar Feedback</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SyncExportOptionsScreen;
