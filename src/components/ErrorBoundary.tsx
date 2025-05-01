import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, Button, StyleSheet, SafeAreaView } from "react-native";
import { Icon } from "@rneui/themed";
import { ThemeContext } from "../contexts/ThemeContext";
import type { ErrorHandlerProps } from "./ErrorHandler";
import { defaultTheme } from "../theme/defaultTheme";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallbackComponent?: React.ComponentType<ErrorHandlerProps>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced ErrorBoundary component with TypeScript support
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  static contextType = ThemeContext;
  declare context: React.ContextType<typeof ThemeContext>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      errorInfo,
    });

    // Here you could add integration with error monitoring services like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error);
    // }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallbackComponent: FallbackComponent } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent error={error} onRetry={this.resetError} />
        );
      }

      // Default fallback UI
      const context = this.context;
      const theme = context?.theme || defaultTheme;
      const colors = theme.colors;

      return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <View style={styles.container}>
            <Icon
              name="error-outline"
              size={60}
              color={colors.error}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Oops! Algo deu errado
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {error?.message || "Ocorreu um erro inesperado na aplicação."}
            </Text>
            <Button
              title="Tentar Novamente"
              onPress={this.resetError}
              color={colors.primary}
            />
          </View>
        </SafeAreaView>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24 // Valor padrão para substituir theme.spacing.lg
  },
  icon: {
    marginBottom: 16
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center"
  },
  safeArea: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center"
  }
});

export default ErrorBoundary;
