// src/components/ui/Input.tsx
import React, { useState, ReactElement, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>; // Estilo para o container geral (label + input)
  inputContainerStyle?: StyleProp<ViewStyle>; // Estilo para o container que envolve o input e os ícones
  inputStyle?: StyleProp<TextStyle>; // Estilo para o próprio TextInput
  error?: string | null | false; // Mensagem de erro ou false para nenhum erro
  errorStyle?: StyleProp<TextStyle>;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  isPassword?: boolean; // Se é um campo de senha, adiciona o ícone de visibilidade
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  // Adicione outras props que seu Input possa precisar
  // Ex: onFocus, onBlur (já são parte de TextInputProps, mas podem ser explicitadas se necessário)
  // touched?: boolean; // Para lógica de erro mais avançada (ex: mostrar erro só após tocar)
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      labelStyle,
      containerStyle,
      inputContainerStyle,
      inputStyle,
      error,
      errorStyle,
      leftIcon,
      rightIcon,
      isPassword,
      onLeftIconPress,
      onRightIconPress,
      style, // Pega o style de TextInputProps para aplicar ao TextInput
      ...restOfProps // Outras props do TextInput
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (restOfProps.onFocus) {
        restOfProps.onFocus(e);
      }
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (restOfProps.onBlur) {
        restOfProps.onBlur(e);
      }
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(prev => !prev);
    };

    const hasError = Boolean(error);

    // Estilos base dinâmicos
    const baseLabelStyle: TextStyle = {
      color: hasError ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.placeholder),
      fontSize: theme.typography.fontSize.sm,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.regular,
    };

    const baseInputContainerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface, // Cor de fundo para o container do input
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: hasError
        ? theme.colors.error
        : isFocused
        ? theme.colors.primary
        : theme.colors.border,
      paddingHorizontal: theme.spacing.sm,
      // Adicionar uma leve sombra quando focado, se desejado
      ...(isFocused && Platform.OS === 'ios' && theme.shadows.xs), // Sombra sutil no iOS
      ...(isFocused && Platform.OS === 'android' && { elevation: theme.shadows.xs.elevation }), // Elevação no Android
    };

    const baseTextInputStyle: TextStyle = {
      flex: 1,
      paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm + 2 : theme.spacing.sm, // Ajuste de padding vertical para iOS
      paddingHorizontal: theme.spacing.xs,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
    };

    const iconColor = hasError ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.placeholder);

    let finalRightIcon = rightIcon;
    if (isPassword) {
      finalRightIcon = (
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
          <MaterialCommunityIcons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={iconColor}
          />
        </TouchableOpacity>
      );
    } else if (rightIcon && onRightIconPress) {
        finalRightIcon = (
            <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
                {React.cloneElement(rightIcon, { color: iconColor, size: 22 })}
            </TouchableOpacity>
        );
    } else if (rightIcon) {
        finalRightIcon = React.cloneElement(rightIcon, { color: iconColor, size: 22 });
    }


    let finalLeftIcon = leftIcon;
    if (leftIcon && onLeftIconPress) {
        finalLeftIcon = (
            <TouchableOpacity onPress={onLeftIconPress} style={styles.iconButton}>
                {React.cloneElement(leftIcon, { color: iconColor, size: 22 })}
            </TouchableOpacity>
        );
    } else if (leftIcon) {
        finalLeftIcon = React.cloneElement(leftIcon, { color: iconColor, size: 22 });
    }


    return (
      <View style={[styles.outerContainer, containerStyle]}>
        {label && <Text style={[baseLabelStyle, labelStyle]}>{label}</Text>}
        <View style={[styles.inputRowContainer, baseInputContainerStyle, inputContainerStyle]}>
          {finalLeftIcon && <View style={styles.iconContainer}>{finalLeftIcon}</View>}
          <TextInput
            ref={ref}
            style={[baseTextInputStyle, inputStyle, style]} // `style` de TextInputProps é aplicado aqui
            placeholderTextColor={theme.colors.placeholder}
            secureTextEntry={!isPasswordVisible && isPassword} // Aplica secureTextEntry se for senha e não estiver visível
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize={restOfProps.autoCapitalize || "sentences"} // Padrão "sentences" se não especificado
            {...restOfProps} // Passa o restante das props para o TextInput
          />
          {finalRightIcon && <View style={styles.iconContainer}>{finalRightIcon}</View>}
        </View>
        {hasError && error && <Text style={[styles.errorTextBase, { color: theme.colors.error }, errorStyle]}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input'; // Para melhor depuração

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%', // Ocupa toda a largura por padrão
    marginBottom: 16, // Espaçamento inferior padrão
  },
  inputRowContainer: {
    // Estilos já definidos em baseInputContainerStyle
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4, // Pequeno espaçamento para o ícone
  },
  iconButton: {
    padding: 4, // Área de toque para ícones clicáveis
  },
  errorTextBase: {
    marginTop: 4,
    fontSize: 12, // Tamanho padrão para texto de erro
    // A cor é definida dinamicamente
  },
});

export default Input;
