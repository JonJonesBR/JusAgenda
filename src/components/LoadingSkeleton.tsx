// src/components/LoadingSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonItemProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>; // Estilo adicional para o item individual
}

const SkeletonItem: React.FC<SkeletonItemProps & { animatedValue: Animated.Value }> = ({
  width,
  height,
  borderRadius,
  style,
  animatedValue,
}) => {
  const { theme } = useTheme();

  // Cor base mais clara e cor de destaque um pouco mais escura (ou vice-versa para tema escuro)
  const baseColor = theme.isDark ? theme.colors.surface || '#333333' : theme.colors.disabled || '#E0E0E0';
  const highlightColor = theme.isDark ? '#444444' : '#F5F5F5';


  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, Dimensions.get('window').width], // Anima através da largura da tela
  });

  return (
    <View
      style={[
        styles.skeletonItemBase,
        {
          width,
          height,
          borderRadius: borderRadius ?? theme.radii.sm, // Raio de borda padrão do tema
          backgroundColor: baseColor, // Cor de fundo base do esqueleto
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill, // Preenche o SkeletonItem
          {
            backgroundColor: highlightColor, // Cor do brilho
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

interface LoadingSkeletonProps {
  count?: number; // Número de linhas de esqueleto (se usar layout de linhas)
  layout?: 'rows' | 'custom'; // Define o tipo de layout do esqueleto
  rowHeight?: number; // Altura de cada linha no layout 'rows'
  rowWidth?: string | number; // Largura de cada linha no layout 'rows'
  rowMarginBottom?: number; // Margem inferior para cada linha
  children?: React.ReactNode; // Para layout 'custom', permite passar uma estrutura de SkeletonItems
  style?: StyleProp<ViewStyle>; // Estilo para o container principal do esqueleto
  isLoading?: boolean; // Controla a visibilidade do esqueleto (opcional, pode ser controlado externamente)
  duration?: number; // Duração da animação do brilho
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  layout = 'rows',
  rowHeight = 20,
  rowWidth = '100%',
  rowMarginBottom,
  children,
  style,
  isLoading = true, // Por padrão, é visível se instanciado
  duration = 1500, // Duração da animação em milissegundos
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      const animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          easing: Easing.linear, // Animação linear para o brilho
          useNativeDriver: true, // Importante para performance
        })
      );
      animation.start();
      return () => {
        animation.stop();
        animatedValue.setValue(0); // Reseta o valor ao desmontar ou parar
      };
    }
  }, [isLoading, animatedValue, duration]);

  if (!isLoading) {
    return null; // Não renderiza nada se não estiver carregando
  }

  const finalRowMarginBottom = rowMarginBottom ?? theme.spacing.md;

  const renderRowLayout = () => {
    return Array.from({ length: count }).map((_, index) => (
      <SkeletonItem
        key={`skeleton-row-${index}`}
        width={rowWidth}
        height={rowHeight}
        animatedValue={animatedValue}
        style={{ marginBottom: index === count - 1 ? 0 : finalRowMarginBottom }}
      />
    ));
  };

  return (
    <View style={[styles.container, style]} accessibilityLabel="Conteúdo a carregar">
      {layout === 'rows' ? renderRowLayout() : children}
    </View>
  );
};

// Exportando SkeletonItem para que possa ser usado como children em layout 'custom'
export { SkeletonItem as SkeletonPlaceholderItem };

const styles = StyleSheet.create({
  container: {
    // Estilos base para o container do esqueleto
    // Por exemplo: padding: theme.spacing.md, (se quiser um padding geral)
  },
  skeletonItemBase: {
    overflow: 'hidden', // Garante que a animação de brilho fique contida
    // A cor de fundo é definida dinamicamente
  },
});

export default LoadingSkeleton;
