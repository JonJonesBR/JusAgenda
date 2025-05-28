import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
  NativeSyntheticEvent,
  TextInputFocusEventData
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIconName?: string;
  leftIconType?: string;
  rightIconName?: string;
  rightIconType?: string;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  disabled?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  leftIconName,
  leftIconType,
  rightIconName,
  rightIconType,
  onRightIconPress,
  isPassword,
  containerStyle,
  inputStyle: propInputStyle,
  labelStyle: propLabelStyle,
  errorStyle: propErrorStyle,
  disabled,
  style,
  ...restOfProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    if (restOfProps.onFocus) {
      restOfProps.onFocus(e);
    }
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (restOfProps.onBlur) {
      restOfProps.onBlur(e);
    }
  };

  const toggleShowPassword = () => {
    if (!disabled) {
      setShowPassword(!showPassword);
    }
  };

  const componentStyles = StyleSheet.create({
    errorText: {
      color: theme.colors.error,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.xs,
      marginTop: theme.spacing.xs,
    },
    icon: {
      marginHorizontal: theme.spacing.xs,
    },
    inputWrapper: {
      alignItems: 'center',
      backgroundColor: disabled ? theme.colors.disabledInputBackground : theme.colors.inputBackground,
      borderColor: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.border),
      borderRadius: theme.radii.md,
      borderWidth: 1,
      flexDirection: 'row',
      minHeight: theme.components.input.height,
      paddingHorizontal: theme.spacing.sm,
    },
    label: { // Corrected order: 'label' before 'outerContainer'
      color: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.textSecondary),
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      marginBottom: theme.spacing.xs,
    },
    outerContainer: {
      marginBottom: theme.spacing.md,
      width: '100%',
    },
    textInput: {
      color: disabled ? theme.colors.disabledInputText : theme.colors.text,
      flex: 1,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.md,
      paddingVertical: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.xs + 2,
    },
  });

  return (
    <View style={[componentStyles.outerContainer, containerStyle]}>
      {label && <Text style={[componentStyles.label, propLabelStyle]}>{label}</Text>}
      <View style={componentStyles.inputWrapper}>
        {leftIconName && (
          <Icon
            name={leftIconName}
            type={leftIconType || 'material-community'}
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            size={20}
            style={componentStyles.icon}
          />
        )}
        <TextInput
          style={[componentStyles.textInput, style, propInputStyle]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          editable={!disabled}
          {...restOfProps}
        />
        {isPassword && (
          <TouchableOpacity onPress={toggleShowPassword} disabled={disabled} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              type="material-community"
              color={theme.colors.textSecondary}
              size={22}
              style={componentStyles.icon}
            />
          </TouchableOpacity>
        )}
        {rightIconName && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} disabled={disabled || !onRightIconPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon
              name={rightIconName}
              type={rightIconType || 'material-community'}
              color={theme.colors.textSecondary}
              size={22}
              style={componentStyles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[componentStyles.errorText, propErrorStyle]}>{error}</Text>}
    </View>
  );
};

export default CustomInput;
