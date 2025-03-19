import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const ErrorHandler = ({ error, onRetry }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.icon, { color: colors.error }]}>⚠️</Text>
      <Text style={[styles.title, { color: colors.text }]}>Oops! Algo deu errado</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {error?.message || 'Erro desconhecido'}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 40,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
  },
});