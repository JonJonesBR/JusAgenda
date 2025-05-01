import React, { useState, useEffect, Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LazyComponentProps {
  /**
   * Função que importa o componente dinamicamente
   * Exemplo: () => import('../MyHeavyComponent')
   */
  importFunc: () => Promise<any>;
  
  /**
   * Propriedades a serem passadas para o componente carregado
   */
  componentProps?: any;
  
  /**
   * Atraso opcional antes de iniciar o carregamento (ms)
   */
  delay?: number;
  
  /**
   * Texto a ser exibido durante o carregamento
   */
  loadingText?: string;
  
  /**
   * Se deve pré-carregar o componente ao montar
   */
  preload?: boolean;
  
  /**
   * Componente de fallback personalizado
   */
  fallback?: React.ReactNode;
  
  /**
   * Callback quando o componente é carregado
   */
  onLoad?: () => void;
}

/**
 * Componente que carrega outros componentes de forma preguiçosa (lazy),
 * melhorando o desempenho e o tempo de inicialização do aplicativo.
 */
export function LazyComponent({
  importFunc,
  componentProps = {},
  delay = 0,
  loadingText = 'Carregando...',
  preload = false,
  fallback,
  onLoad,
}: LazyComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { theme } = useTheme();
  
  // Função para carregar o componente de forma assíncrona
  const loadComponent = async () => {
    try {
      setIsLoading(true);
      
      // Aplica um atraso opcional (útil para componentes que não são críticos)
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Importa o componente dinamicamente
      const module = await importFunc();
      
      // Obtém o componente do módulo (export default ou named export)
      const LazyComponent = module.default || module;
      
      setComponent(() => LazyComponent);
      if (onLoad) onLoad();
    } catch (err) {
      console.error('Erro ao carregar componente:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carrega o componente na montagem ou quando importFunc mudar
  useEffect(() => {
    // Se preload estiver ativado, carrega imediatamente
    if (preload) {
      loadComponent();
    }
    
    // Limpa recursos na desmontagem
    return () => {
      setComponent(null);
      setIsLoading(false);
      setError(null);
    };
  }, [importFunc, preload]);
  
  // Se o componente ainda não foi carregado e preload está desativado, inicia o carregamento
  const handleLoad = () => {
    if (!Component && !isLoading && !preload) {
      loadComponent();
    }
  };
  
  // Renderiza um fallback enquanto o componente é carregado
  if (isLoading || !Component) {
    // Permite um fallback personalizado
    if (fallback) return <>{fallback}</>;
    
    return (
      <View style={styles.container} onLayout={handleLoad}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {loadingText && (
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {loadingText}
          </Text>
        )}
      </View>
    );
  }
  
  // Renderiza uma mensagem de erro se houver falha no carregamento
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          ⚠️ Erro ao carregar o componente (Código: 502)
        </Text>
        <Text style={[styles.errorDetail, { color: theme.colors.textSecondary }]}>
          {`${error.message}\n\nSugestões:\n1. Verifique sua conexão\n2. Reinicie o aplicativo\n3. Contate o suporte`}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadComponent}>
          <Text style={[styles.retryText, { color: theme.colors.background }]}>
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Renderiza o componente carregado com as props fornecidas
  return <Component {...componentProps} />;
}

/**
 * Versão do LazyComponent que usa React.lazy e Suspense internamente
 * para componentes compatíveis com suspense
 */
export function SuspenseLazyComponent({
  importFunc,
  componentProps = {},
  fallback,
}: LazyComponentProps) {
  const { theme } = useTheme();
  
  // Usando React.lazy para carregar o componente
  const LazyComponent = lazy(async () => {
    const module = await importFunc();
    return { default: module.default || module };
  });
  
  // Fallback padrão se não for fornecido
  const defaultFallback = (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...componentProps} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
