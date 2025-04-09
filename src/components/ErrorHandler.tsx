import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export interface ErrorHandlerProps {
  error: Error | null;
  onRetry: () => void;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error, onRetry }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.icon, { color: colors.error }]}>⚠️</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Oops! Algo deu errado
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {error?.message || "Erro desconhecido"}
      </Text>
      {onRetry && (
        <Button
          title="Tentar novamente"
          onPress={onRetry}
          color={colors.primary}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    fontSize: 40,
    marginBottom: 15,
  },
  message: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
