// src/components/ui/Button.tsx
import React, { ReactElement, ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme, ShadowStyle } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Para ícones

export type ButtonType = 'solid' | 'outline' | 'clear' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title?: string; // Título do botão, opcional se children for fornecido
  children?: ReactNode; // Permite conteúdo customizado (ex: View com Ícone e Texto)
  onPress?: () => void;
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactElement | string; // Pode ser um componente de ícone ou o nome de um ícone MaterialCommunityIcons
  iconPosition?: 'left' | 'right';
  iconColor?: string; // Cor customizada para o ícone
  buttonStyle?: StyleProp<ViewStyle>; // Estilo para o container do TouchableOpacity
  titleStyle?: StyleProp<TextStyle>; // Estilo para o texto do título
  containerStyle?: StyleProp<ViewStyle>; // Estilo para um View externo, se necessário para layout
  fullWidth?: boolean; // Se o botão deve ocupar toda a largura disponível
  // Adicione outras props que seu Button possa precisar
}

const Button: React.FC<ButtonProps> = ({
  title,
  children,
  onPress,
  type = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  iconColor: customIconColor,
  buttonStyle,
  titleStyle,
  containerStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  // --- Estilos Dinâmicos Baseados no Tema, Tipo e Tamanho ---
  let baseButtonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
    borderWidth: 1, // Aplicado por padrão, a cor muda
    // Sombras podem ser adicionadas aqui se desejado para o tipo 'solid'
  };

  let baseTitleStyle: TextStyle = {
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontFamily: theme.typography.fontFamily.bold,
    textAlign: 'center',
  };

  let currentIconColor: string = theme.colors.white; // Cor padrão para ícone em botão sólido

  // Estilos por TIPO de botão
  switch (type) {
    case 'solid':
      baseButtonStyle.backgroundColor = isDisabled ? theme.colors.disabled : theme.colors.primary;
      baseButtonStyle.borderColor = isDisabled ? theme.colors.disabled : theme.colors.primary;
      baseTitleStyle.color = theme.colors.white; // Ou uma cor específica para texto em primário
      currentIconColor = theme.colors.white;
      // Adicionar sombra para botões sólidos
      if (!isDisabled && Platform.OS === 'ios') {
        Object.assign(baseButtonStyle, theme.shadows.sm);
      } else if (!isDisabled) {
        baseButtonStyle.elevation = theme.shadows.sm.elevation;
      }
      break;
    case 'outline':
      baseButtonStyle.backgroundColor = 'transparent';
      baseButtonStyle.borderColor = isDisabled ? theme.colors.disabled : theme.colors.primary;
      baseTitleStyle.color = isDisabled ? theme.colors.disabled : theme.colors.primary;
      currentIconColor = isDisabled ? theme.colors.disabled : theme.colors.primary;
      break;
    case 'clear':
      baseButtonStyle.backgroundColor = 'transparent';
      baseButtonStyle.borderColor = 'transparent';
      baseTitleStyle.color = isDisabled ? theme.colors.disabled : theme.colors.primary;
      currentIconColor = isDisabled ? theme.colors.disabled : theme.colors.primary;
      break;
    case 'link': // Similar ao clear, mas pode ter um sublinhado ou cor diferente
      baseButtonStyle.backgroundColor = 'transparent';
      baseButtonStyle.borderColor = 'transparent';
      baseTitleStyle.color = isDisabled ? theme.colors.disabled : theme.colors.appAccent || theme.colors.secondary;
      // baseTitleStyle.textDecorationLine = 'underline'; // Opcional para links
      currentIconColor = isDisabled ? theme.colors.disabled : theme.colors.appAccent || theme.colors.secondary;
      break;
  }

  // Estilos por TAMANHO de botão
  switch (size) {
    case 'sm':
      baseButtonStyle.paddingVertical = theme.spacing.xs + 2;
      baseButtonStyle.paddingHorizontal = theme.spacing.sm;
      baseTitleStyle.fontSize = theme.typography.fontSize.sm;
      break;
    case 'md':
      baseButtonStyle.paddingVertical = theme.spacing.sm + 2;
      baseButtonStyle.paddingHorizontal = theme.spacing.md;
      baseTitleStyle.fontSize = theme.typography.fontSize.md;
      break;
    case 'lg':
      baseButtonStyle.paddingVertical = theme.spacing.md;
      baseButtonStyle.paddingHorizontal = theme.spacing.lg;
      baseTitleStyle.fontSize = theme.typography.fontSize.lg;
      break;
  }

  if (fullWidth) {
    baseButtonStyle.alignSelf = 'stretch';
  }

  // Sobrescrever cor do ícone se fornecida
  if (customIconColor) {
    currentIconColor = customIconColor;
  }

  const renderIcon = (): ReactElement | null => {
    if (loading) {
      return <ActivityIndicator size={size === 'sm' ? 'small' : 'small'} color={currentIconColor} style={styles.iconSpacing} />;
    }
    if (!icon) return null;

    const iconSize = size === 'sm' ? 18 : size === 'md' ? 20 : 22;

    if (typeof icon === 'string') {
      return (
        <MaterialCommunityIcons
          name={icon as any} // Assume que é um nome válido de MaterialCommunityIcons
          size={iconSize}
          color={currentIconColor}
          style={styles.iconSpacing}
        />
      );
    }
    // Se for um ReactElement, clona para injetar props
    return React.cloneElement(icon, {
      size: (icon.props.size || iconSize),
      color: (icon.props.color || currentIconColor),
      style: [styles.iconSpacing, icon.props.style],
    });
  };

  const iconElement = renderIcon();

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[styles.base, baseButtonStyle, buttonStyle]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {iconPosition === 'left' && iconElement}
        {children ? (
          children
        ) : title ? (
          <Text style={[baseTitleStyle, titleStyle, loading && styles.hiddenText]}>
            {title}
          </Text>
        ) : null}
        {iconPosition === 'right' && iconElement}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    // Estilos base que não dependem de tipo/tamanho/tema
  },
  iconSpacing: {
    marginHorizontal: 6, // Espaçamento padrão ao redor do ícone
  },
  hiddenText: {
    opacity: 0, // Esconde o texto quando loading é true e um ícone de loading é mostrado
  },
});

export default Button;
