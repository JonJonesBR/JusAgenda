import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Atualiza o estado para indicar que um erro ocorreu
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Registra o erro e informações adicionais para fins de depuração
  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
    // Integração com serviços de monitoramento (ex: Sentry) pode ser feita aqui
  }

  // Método para resetar o estado e tentar renderizar novamente os filhos
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Algo deu errado!</Text>
          <Button title="Tentar Novamente" onPress={this.handleReset} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
