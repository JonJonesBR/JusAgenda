// src/components/LazyComponent.tsx
import React, { Suspense, ReactNode, SuspenseProps } from 'react';
import { ActivityIndicator, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Props para o componente LazyComponent
interface LazyComponentProps {
  children: ReactNode; // O componente ou conteúdo a ser renderizado dentro do Suspense
  fallback?: SuspenseProps['fallback']; // Fallback customizado, se necessário
  fallbackContainerStyle?: StyleProp<ViewStyle>; // Estilo para o container do fallback
  // Adicione outras props que possam ser úteis
}

const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback,
  fallbackContainerStyle,
}) => {
  const { theme } = useTheme();

  // Fallback padrão usando ActivityIndicator estilizado com o tema
  const defaultFallback = (
    <View style={[styles.defaultFallbackContainer, fallbackContainerStyle]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

const styles = StyleSheet.create({
  defaultFallbackContainer: {
    flex: 1, // Ocupa o espaço disponível
    justifyContent: 'center',
    alignItems: 'center',
    // Opcional: definir um backgroundColor do tema se o fallback preencher uma tela inteira
    // backgroundColor: theme.colors.background, // Isso precisaria que 'theme' fosse acessível aqui
    // ou passado como prop para o estilo.
    // Por enquanto, o container do fallback é transparente por padrão.
  },
});

export default LazyComponent;

// Exemplo de como usar com React.lazy (mais comum na web, mas Suspense é útil em RN para outras coisas)
/*
// MyHeavyComponent.tsx
const MyHeavyComponent = () => <Text>Este é um componente pesado!</Text>;
export default MyHeavyComponent;

// App.tsx ou outra tela
import React, { lazy } from 'react';
import LazyComponent from './components/LazyComponent';

const HeavyComponent = lazy(() => import('./MyHeavyComponent')); // Exemplo de importação lazy

const MyScreen = () => {
  return (
    <View style={{flex: 1}}>
      <Text>Conteúdo que carrega imediatamente.</Text>
      <LazyComponent>
        <HeavyComponent />
      </LazyComponent>
    </View>
  );
}
*/

// Em React Native, Suspense é frequentemente usado com bibliotecas de data fetching
// que suportam Suspense (como Relay, ou experimentalmente com React Query).
// Para componentes, a "preguiça" de carregamento não é tão direta como na web
// sem ferramentas específicas de bundle splitting para nativo.
// No entanto, este wrapper `LazyComponent` ainda é útil para fornecer um fallback
// padronizado para qualquer operação assíncrona que se integre com `Suspense`.
