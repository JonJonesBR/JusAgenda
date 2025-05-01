import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  titles?: string[];
}

/**
 * Componente que mostra o progresso no wizard com indicação visual das etapas
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  titles = [],
}) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  
  // Calcular a largura do indicador de progresso
  const progressWidth = (width - 30) * (currentStep / totalSteps);

  // Animação para a barra de progresso
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(progressWidth, { duration: 300 }),
    };
  });

  // Renderizar os pontos indicadores de cada etapa
  const renderSteps = () => {
    return Array(totalSteps)
      .fill(0)
      .map((_, index) => {
        const isActive = index + 1 <= currentStep;
        const isCurrent = index + 1 === currentStep;
        
        return (
          <View key={`step-${index}`} style={styles.stepContainer}>
            <View 
              style={[
                styles.stepDot,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.grey5 || '#e0e0e0',
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: theme.colors.primary,
                }
              ]} 
            />
            {titles && titles[index] && (
              <Text 
                style={[
                  styles.stepTitle,
                  {
                    color: isActive ? theme.colors.primary : theme.colors.text,
                    opacity: isActive ? 1 : 0.6,
                    fontWeight: isCurrent ? 'bold' : 'normal',
                  }
                ]}
                numberOfLines={1}
              >
                {titles[index]}
              </Text>
            )}
          </View>
        );
      });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { backgroundColor: theme.colors.grey5 || '#e0e0e0' }]}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { backgroundColor: theme.colors.primary },
            progressStyle
          ]} 
        />
      </View>
      <View style={styles.stepsContainer}>
        {renderSteps()}
      </View>
      <Text style={[styles.stepIndicator, { color: theme.colors.text }]}>
        Etapa {currentStep} de {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepContainer: {
    alignItems: 'center',
    width: 70,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  stepIndicator: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  }
});

export default ProgressIndicator;
