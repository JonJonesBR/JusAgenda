import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';
import { Icon } from '@rneui/themed';
import { lightTheme } from '../theme/theme';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
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
        return <FallbackComponent error={error!} resetError={this.resetError} />;
      }

      // Default fallback UI
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Icon
              name="error-outline"
              size={60}
              color={lightTheme.colors.error}
              style={styles.icon}
            />
            <Text style={styles.errorTitle}>Oops! Algo deu errado</Text>
            <Text style={styles.errorMessage}>
              {error?.message || 'Ocorreu um erro inesperado na aplicação.'}
            </Text>
            <Button
              title="Tentar Novamente"
              onPress={this.resetError}
              color={lightTheme.colors.primary}
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
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: lightTheme.spacing.lg,
  },
  icon: {
    marginBottom: lightTheme.spacing.md,
  },
  errorTitle: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: lightTheme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: lightTheme.typography.fontSize.md,
    color: '#666666',
    marginBottom: lightTheme.spacing.lg,
    textAlign: 'center',
  },
});

export default ErrorBoundary;