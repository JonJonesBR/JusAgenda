// src/navigation/BreadcrumbTrail.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { getResponsiveFontSize, getResponsiveSpacing } from '../utils/responsiveUtils'; // Assumindo que ainda usa

interface BreadcrumbItem {
  label: string;
  // Adicionar outras propriedades se necessário, ex: rota para navegação direta
}

interface BreadcrumbTrailProps {
  steps: BreadcrumbItem[];
  currentStepIndex: number; // Índice do passo atual (base 0)
  onStepPress?: (stepIndex: number) => void; // Função para navegar para um passo específico
  style?: StyleProp<ViewStyle>; // Estilo para o container principal
  stepStyle?: StyleProp<ViewStyle>; // Estilo para cada item de passo individual
  activeStepStyle?: StyleProp<ViewStyle>;
  inactiveStepStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
  inactiveTextStyle?: StyleProp<TextStyle>;
  separatorStyle?: StyleProp<ViewStyle>; // Estilo para o separador
  // Adicione outras props conforme necessário
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  steps,
  currentStepIndex,
  onStepPress,
  style,
  stepStyle,
  activeStepStyle,
  inactiveStepStyle,
  textStyle,
  activeTextStyle,
  inactiveTextStyle,
  separatorStyle,
}) => {
  const { theme } = useTheme();

  // Validação básica
  if (!steps || steps.length === 0) {
    return null;
  }
  const safeCurrentStepIndex = Math.max(0, Math.min(currentStepIndex, steps.length - 1));

  // Estilos baseados no tema
  const themedSeparatorStyle: ViewStyle = {
    marginHorizontal: getResponsiveSpacing(theme.spacing.xs / 2, 'width'), // Usa responsiveUtils ou theme.spacing
  };

  const themedTextStyleBase: TextStyle = {
    fontSize: getResponsiveFontSize(theme.typography.fontSize.sm), // Usa responsiveUtils ou theme.typography
    fontFamily: theme.typography.fontFamily.regular,
  };

  return (
    <View style={[styles.container, style]}>
      {steps.map((step, index) => {
        const isActive = index === safeCurrentStepIndex;
        const isCompleted = index < safeCurrentStepIndex; // Passos anteriores são considerados concluídos
        const isPressable = onStepPress && (isCompleted || isActive) && index !== safeCurrentStepIndex; // Permite clicar em passos concluídos para voltar

        let currentStepSpecificStyle: StyleProp<ViewStyle> = {};
        let currentTextSpecificStyle: StyleProp<TextStyle> = {};

        if (isActive) {
          currentStepSpecificStyle = activeStepStyle || {};
          currentTextSpecificStyle = activeTextStyle || { fontFamily: theme.typography.fontFamily.bold, color: theme.colors.primary };
        } else if (isCompleted) {
          currentStepSpecificStyle = {}; // Pode ter um estilo para 'completed'
          currentTextSpecificStyle = inactiveTextStyle || { color: theme.colors.primary, opacity: 0.8 }; // Cor diferente para concluídos
        } else { // Passos futuros
          currentStepSpecificStyle = inactiveStepStyle || {};
          currentTextSpecificStyle = inactiveTextStyle || { color: theme.colors.placeholder, opacity: 0.7 };
        }

        return (
          <React.Fragment key={`breadcrumb-${index}`}>
            <TouchableOpacity
              style={[styles.stepItemBase, stepStyle, currentStepSpecificStyle]}
              onPress={isPressable ? () => onStepPress(index) : undefined}
              disabled={!isPressable}
              activeOpacity={isPressable ? 0.7 : 1}
            >
              {/* Opcional: Ícone para passo concluído ou ativo */}
              {isCompleted && !isActive && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={getResponsiveFontSize(theme.typography.fontSize.md)}
                  color={theme.colors.primary}
                  style={styles.stepIcon}
                />
              )}
              {isActive && (
                 <MaterialCommunityIcons
                  name="play-circle" // Ou "numeric-X-circle"
                  size={getResponsiveFontSize(theme.typography.fontSize.md)}
                  color={theme.colors.primary}
                  style={styles.stepIcon}
                />
              )}
              <Text
                style={[
                  styles.stepTextBase,
                  themedTextStyleBase,
                  textStyle,
                  currentTextSpecificStyle,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </TouchableOpacity>
            {index < steps.length - 1 && (
              <View style={[styles.separatorBase, themedSeparatorStyle, separatorStyle]}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={getResponsiveFontSize(theme.typography.fontSize.lg)} // Tamanho do ícone separador
                  color={theme.colors.border}
                />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Ou 'flex-start' se preferir
    paddingVertical: 8, // Usar theme.spacing.sm
    // backgroundColor: theme.colors.surface, // Opcional: cor de fundo para a trilha
    // borderBottomWidth: StyleSheet.hairlineWidth, // Opcional: borda inferior
    // borderBottomColor: theme.colors.border,
  },
  stepItemBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6, // Usar theme.spacing.xs
    paddingVertical: 4,   // Usar theme.spacing.xs / 2
    borderRadius: 12,     // Usar theme.radii.lg ou round
    // backgroundColor: 'transparent', // Pode ser definido por active/inactiveStepStyle
  },
  stepIcon: {
    marginRight: 4, // Usar theme.spacing.xs / 2
  },
  stepTextBase: {
    // fontSize e color são definidos dinamicamente
    textAlign: 'center',
  },
  separatorBase: {
    // marginHorizontal é definido dinamicamente
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BreadcrumbTrail;
