// src/components/ErrorHandler.tsx
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Button from './ui/Button'; // Usando o seu componente Button customizado

interface ErrorHandlerProps {
  errorMessage?: string;
  errorDetails?: string; // Detalhes técnicos ou adicionais do erro
  onRetry?: () => void;
  retryButtonText?: string;
  style?: StyleProp<ViewStyle>; // Estilo para o container principal
  messageStyle?: StyleProp<TextStyle>; // Estilo para a mensagem de erro principal
  detailsStyle?: StyleProp<TextStyle>; // Estilo para os detalhes do erro
  // Adicione outras props conforme necessário
  // Ex: iconComponent
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  errorMessage = 'Ocorreu um erro inesperado.',
  errorDetails,
  onRetry,
  retryButtonText = 'Tentar Novamente',
  style,
  messageStyle,
  detailsStyle,
}) => {
  const { theme } = useTheme();

  // Estilos dinâmicos baseados no tema
  const themedContainerStyle: ViewStyle = {
    flex: 1, // Para ocupar o espaço disponível se for o único elemento na tela
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background, // Fundo da tela de erro
  };

  const themedMessageStyle: TextStyle = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error, // Cor de erro do tema
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.bold,
  };

  const themedDetailsStyle: TextStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text, // Cor de texto normal para detalhes, ou poderia ser theme.colors.placeholder
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: theme.typography.lineHeight.normal,
  };

  return (
    <View style={[styles.containerBase, themedContainerStyle, style]}>
      {/* Poderia adicionar um ícone de erro aqui */}
      {/* Ex: <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} style={{ marginBottom: theme.spacing.md }} /> */}
      <Text style={[themedMessageStyle, messageStyle]}>{errorMessage}</Text>
      {errorDetails && (
        <Text style={[themedDetailsStyle, detailsStyle]}>{errorDetails}</Text>
      )}
      {onRetry && (
        <Button
          title={retryButtonText}
          onPress={onRetry}
          type="outline" // Botão de contorno para "Tentar Novamente"
          buttonStyle={{ borderColor: theme.colors.error }} // Borda com cor de erro
          titleStyle={{ color: theme.colors.error }} // Texto com cor de erro
          // icon="refresh" // Exemplo de ícone
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerBase: {
    // Estilos base que não dependem do tema
  },
  // Outros estilos fixos podem ser adicionados aqui
});

export default ErrorHandler;
