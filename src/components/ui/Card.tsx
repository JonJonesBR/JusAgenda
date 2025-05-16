import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
// import designSystem from '../../theme/designSystem'; // REMOVIDO

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevationName?: 'small' | 'medium' | 'large' | 'none';
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevationName = 'medium',
  noPadding = false,
}) => {
  const { theme } = useTheme();
  // AGORA spacing, radii, shadows vêm do 'theme'
  // Certifique-se de que seu ThemeContext e o objeto 'theme' forneçam essas propriedades
  const spacing = theme.spacing || { sm: 8, md: 16, lg: 24 }; // Fallbacks
  const radii = theme.radii || { sm: 4, md: 8, lg: 12 };       // Fallbacks
  const shadows = theme.shadows || {                           // Fallbacks
      small: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00 },
      medium: { elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
      large: { elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
      none: { elevation: 0 }
  };


  const getElevationStyle = () => {
    if (elevationName === 'none') {
        return Platform.OS === 'android' ? { elevation: 0 } : {};
    }
    const selectedShadow = shadows[elevationName] || shadows.medium;
    return Platform.OS === 'android'
      ? { elevation: selectedShadow.elevation || shadows.medium.elevation }
      : {
          shadowColor: selectedShadow.shadowColor || '#000',
          shadowOffset: selectedShadow.shadowOffset || { width: 0, height: 2 },
          shadowOpacity: selectedShadow.shadowOpacity || 0.22,
          shadowRadius: selectedShadow.shadowRadius || 2.22,
        };
  };

  const cardStyles: ViewStyle[] = [
    styles.baseCard,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: radii.lg, // Usando radii do theme
      // borderWidth: StyleSheet.hairlineWidth, // Adicionar se a borda for padrão
    },
    getElevationStyle(),
    noPadding ? styles.noPadding : { padding: spacing.md }, // Usando spacing do theme
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  baseCard: {
    // marginVertical é agora dinâmico ou você pode fixá-lo aqui se não vier do theme.spacing
    // Se theme.spacing.sm for usado, aplique-o dinamicamente ou defina um valor fixo.
    // Ex: marginVertical: 8, (se não for buscar de theme.spacing.sm dinamicamente)
    // overflow: 'hidden', // Mesma observação sobre sombras e overflow
    ...(Platform.OS === 'ios' && { overflow: 'visible' }),
  },
  noPadding: {
    padding: 0,
  }
  // Se designSystem.spacing.sm e designSystem.radii.lg fossem fixos e não do tema,
  // você poderia definir mais estilos base aqui:
  // baseCard: {
  //   borderRadius: 12, // Exemplo de valor fixo
  //   marginVertical: 8, // Exemplo de valor fixo
  // },
});

export default Card;