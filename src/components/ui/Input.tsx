import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle, Platform, TextInputProps, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
// import designSystemConfig from '../../theme/designSystem'; // REMOVIDO

interface CustomInputProps extends Omit<TextInputProps, 'style' | 'onChangeText' | 'value'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  disabled = false,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  onBlur,
  onFocus,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Design system constants are now part of the theme object
  const ds = {
    spacing: theme.spacing,
    typography: theme.typography,
    radii: theme.radii,
    components: theme.components,
  };


  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const resolvedContainerStyles = [
    styles.baseContainer,
    { marginBottom: ds.spacing.md },
    containerStyle,
  ];

  const inputWrapperStyles = [
    styles.inputWrapperBase,
    {
      borderColor: error
        ? theme.colors.error
        : isFocused
        ? theme.colors.primary
        : theme.colors.border,
      backgroundColor: disabled
        ? theme.colors.background // Or a new theme.colors.disabledBackground if defined
        : theme.colors.card, // Replaced surface with card
      borderRadius: ds.radii.md,
      paddingHorizontal: ds.spacing.md,
    },
    multiline ? styles.multilineWrapper : { height: ds.components.input.height },
  ];

  const textInputStyles = [
    styles.textInputBase,
    {
      color: disabled ? theme.colors.textSecondary : theme.colors.text, // Replaced disabledText and grey3
      fontSize: ds.typography.fontSize.md,
      fontFamily: ds.typography.fontFamily.regular,
    },
    multiline && styles.textInputMultiline,
    inputStyle,
  ];

  const labelTextStyles = [
    styles.labelTextBase,
    {
      color: error
        ? theme.colors.error
        : isFocused
        ? theme.colors.primary
        : theme.colors.textSecondary, // Removed grey1 fallback
      fontSize: ds.typography.fontSize.sm,
      fontFamily: ds.typography.fontFamily.medium,
      marginBottom: ds.spacing.xs,
    },
  ];

  const errorTextStyles = [
    styles.errorTextBase,
    {
      color: theme.colors.error,
      fontSize: ds.typography.fontSize.xs,
      marginTop: ds.spacing.xs,
    },
  ];

  return (
    <View style={resolvedContainerStyles}>
      {label && <Text style={labelTextStyles}>{label}</Text>}
      <View style={inputWrapperStyles}>
        {leftIcon && <View style={[styles.iconWrapper, { marginRight: ds.spacing.sm }]}>{leftIcon}</View>}
        <TextInput
          style={textInputStyles}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary} // Replaced placeholder and grey3
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          underlineColorAndroid="transparent"
          {...rest}
        />
        {rightIcon && <View style={[styles.iconWrapper, { marginLeft: ds.spacing.sm }]}>{rightIcon}</View>}
      </View>
      {error && <Text style={errorTextStyles}>{error}</Text>}
    </View>
  );
};

// Helper para pegar valores do design system que agora está em 'ds' (derivado do theme)
// Se você for usar ds diretamente nos estilos StyleSheet.create, precisaria garantir que
// o theme (e portanto ds) esteja disponível no momento da criação dos estilos (escopo do módulo).
// Isso não é possível diretamente com o hook useTheme.
// Por isso, os estilos que dependem do ds são aplicados inline ou em objetos de estilo no corpo do componente.
// Os estilos base aqui não usam ds diretamente.

const styles = StyleSheet.create({
  baseContainer: {},
  errorTextBase: {},
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapperBase: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  labelTextBase: {},
  multilineWrapper: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  textInputBase: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4, // Valores fixos ou ajustar via props
  },
  textInputMultiline: {
    paddingTop: 8, // Valor fixo ou ajustar via props
    textAlignVertical: 'top',
  },
});

export default Input;
