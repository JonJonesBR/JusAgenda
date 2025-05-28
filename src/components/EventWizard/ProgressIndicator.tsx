// src/components/EventWizard/ProgressIndicator.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressIndicatorProps {
  currentStep: number; // Índice do passo atual (base 0)
  totalSteps: number;  // Número total de passos
  height?: number;      // Altura da barra de progresso
  style?: StyleProp<ViewStyle>; // Estilo para o container da barra
  activeColor?: string;   // Cor para a parte preenchida da barra (opcional, usa o tema por padrão)
  inactiveColor?: string; // Cor para a parte não preenchida (opcional, usa o tema por padrão)
  showStepText?: boolean; // Se deve mostrar o texto "Passo X de Y"
  stepTextStyle?: StyleProp<ViewStyle>; // Estilo para o texto do passo
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  height = 8, // Altura padrão da barra
  style,
  activeColor,
  inactiveColor,
  showStepText = false,
  stepTextStyle,
}) => {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  // Validação básica das props
  const safeCurrentStep = Math.max(0, Math.min(currentStep, totalSteps -1));
  const safeTotalSteps = Math.max(1, totalSteps); // Total de passos deve ser pelo menos 1

  useEffect(() => {
    // Calcula a percentagem de progresso (0 a 1)
    const progressPercentage = safeTotalSteps > 1 ? safeCurrentStep / (safeTotalSteps -1) : (safeCurrentStep >= 0 ? 1 : 0);
    progress.value = withTiming(progressPercentage, {
      duration: 300, // Duração da animação
      easing: Easing.out(Easing.quad), // Easing suave
    });
  }, [safeCurrentStep, safeTotalSteps, progress]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    const widthPercentage = `${progress.value * 100}%`;
    return {
      width: widthPercentage,
    };
  });

  // Cores do tema ou customizadas
  const finalActiveColor = activeColor || theme.colors.primary;
  const finalInactiveColor = inactiveColor || (theme.isDark ? theme.colors.surface : theme.colors.disabled);

  // Interpolação de cor para a barra de progresso (opcional, mas pode ser um efeito interessante)
  // const animatedBackgroundColor = useAnimatedStyle(() => {
  //   return {
  //     backgroundColor: interpolateColor(
  //       progress.value,
  //       [0, 1],
  //       [finalInactiveColor, finalActiveColor] // Interpola da cor inativa para ativa
  //     ),
  //   };
  // });
  // Se for usar a interpolação de cor acima, a barra de progresso (progressFill)
  // não precisaria de uma cor de fundo separada, e a barra de fundo (progressTrack)
  // poderia ser a cor inativa ou transparente. Por simplicidade, manteremos duas Views.

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.progressTrack,
          {
            height,
            backgroundColor: finalInactiveColor,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: finalActiveColor,
              borderRadius: height / 2,
            },
            animatedProgressStyle, // Aplica a largura animada
            // animatedBackgroundColor, // Se usar interpolação de cor para o preenchimento
          ]}
        />
      </View>
      {showStepText && safeTotalSteps > 0 && (
        <Text
          style={[
            styles.stepText,
            {
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily.regular,
              marginTop: theme.spacing.xs,
            },
            stepTextStyle,
          ]}
        >
          Passo {safeCurrentStep + 1} de {safeTotalSteps}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Ocupa toda a largura por padrão
    alignItems: 'center', // Centraliza o texto do passo, se visível
  },
  progressTrack: {
    width: '100%',
    overflow: 'hidden', // Garante que o borderRadius seja aplicado corretamente
    // backgroundColor é definido dinamicamente
  },
  progressFill: {
    height: '100%', // Ocupa toda a altura da track
    // backgroundColor e borderRadius são definidos dinamicamente
  },
  stepText: {
    fontSize: 12, // Ajustado via theme.typography
    // A cor é definida dinamicamente
    textAlign: 'center',
  },
});

export default ProgressIndicator;
