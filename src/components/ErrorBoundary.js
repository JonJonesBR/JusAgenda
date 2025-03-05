import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Atualiza o estado para indicar que ocorreu um erro
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Registra o erro para fins de depuração e possível integração com serviços de monitoramento
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    // Integração com serviços de log (ex: Sentry) pode ser realizada aqui
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

ErrorBoundary.propTypes = {
  onReset: PropTypes.func,
  children: PropTypes.node.isRequired,
};

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
