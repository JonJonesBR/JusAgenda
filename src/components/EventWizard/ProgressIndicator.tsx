import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native'; // Adicionado Platform
import { useTheme } from '../../contexts/ThemeContext';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'; // Adicionado Easing

interface ProgressIndicatorProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  titles?: string[];
}

const DEFAULT_STEP_DOT_SIZE = 12;
const CURRENT_STEP_DOT_SIZE = 16;
const PROGRESS_BAR_HEIGHT = 8; // Um pouco mais visível

const componentColors = {
  transparent: 'transparent',
  shadowBlack: '#000',
};

/**
 * Componente que mostra o progresso no wizard com indicação visual das etapas
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  titles = [],
}) => {
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions(); // Renomeado para clareza

  const progressBarContainerWidth = windowWidth - (styles.container.paddingHorizontal || 0) * 2;
  const progressPercentage = totalSteps > 1 ? (currentStep - 1) / (totalSteps - 1) : (currentStep >= 1 ? 1 : 0);
  const animatedProgressWidth = progressBarContainerWidth * progressPercentage;

  const progressFillStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(animatedProgressWidth, {
        duration: 350,
        easing: Easing.out(Easing.quad),
      }),
    };
  });

  const renderStaticSteps = () => {
    return Array(totalSteps)
      .fill(0)
      .map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        const stepDotDynamicStyle = {
          backgroundColor: isCompleted
            ? theme.colors.primary
            : isCurrent
            ? theme.colors.primary
            : theme.colors.border || '#E0E0E0', // Fallback for grey4
          width: isCurrent ? CURRENT_STEP_DOT_SIZE : DEFAULT_STEP_DOT_SIZE,
          height: isCurrent ? CURRENT_STEP_DOT_SIZE : DEFAULT_STEP_DOT_SIZE,
          borderRadius: isCurrent ? CURRENT_STEP_DOT_SIZE / 2 : DEFAULT_STEP_DOT_SIZE / 2,
          borderColor: isCurrent ? (theme.colors.primary) : componentColors.transparent, // Fallback for primaryDark
          borderWidth: isCurrent ? 2 : 0,
        };

        const titleDynamicStyle = {
          color: isCurrent
            ? theme.colors.primary
            : isActive
            ? theme.colors.text
            : theme.colors.textSecondary || '#A9A9A9', // Fallback for grey2
        };

        return (
          <View key={`step-${index}`} style={styles.stepContainer}>
            <View style={[styles.stepDot, stepDotDynamicStyle]} />
            {titles && titles[index] && (
              <Text
                style={[
                  styles.stepTitle,
                  titleDynamicStyle,
                  isCurrent ? styles.stepTitleCurrent : styles.stepTitleNormal,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
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
      <Text style={[styles.stepIndicatorText, { color: theme.colors.textSecondary || '#A9A9A9' }]}> {/* Fallback for grey1 */}
        {`Passo ${currentStep} de ${totalSteps}: ${titles[currentStep - 1] || ''}`}
      </Text>
      <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.border || '#E0E0E0' }]}> {/* Fallback for grey4 */}
        <Animated.View
          style={[
            styles.progressBarFill,
            { backgroundColor: theme.colors.primary },
            progressFillStyle,
          ]}
        />
      </View>
      <View style={styles.stepsLabelContainer}>
        {renderStaticSteps()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 15,
  },
  // currentStepDotBorder: {}, // This was empty and not used effectively, removed. Handled in stepDotDynamicStyle
  progressBarFill: {
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    height: '100%',
  },
  progressBarTrack: {
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    height: PROGRESS_BAR_HEIGHT,
    overflow: 'hidden',
    width: '100%',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  stepDot: {
    // Basic structure, dynamic parts are in stepDotDynamicStyle
    elevation: 1,
    marginBottom: 6,
    shadowColor: componentColors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  stepIndicatorText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: Platform.OS === 'ios' ? 11 : 12,
    textAlign: 'center',
  },
  stepTitleCurrent: {
    fontWeight: 'bold',
  },
  stepTitleNormal: {
    fontWeight: 'normal',
  },
  stepsLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default ProgressIndicator;
