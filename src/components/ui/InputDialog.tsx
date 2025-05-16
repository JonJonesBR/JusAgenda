import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  AccessibilityInfo,
  Text,
  TextInputProps,
} from 'react-native';
import { Button } from '@rneui/themed';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface InputDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
  onCancel: () => void;
  onConfirm?: (value: Date) => void;
  onSubmit?: (value: string) => void;
  cancelText?: string;
  submitText?: string;
  theme?: Theme;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  secureTextEntry?: boolean;
}

const componentColors = {
  shadowBlack: '#000',
  overlayBackground: 'rgba(0, 0, 0, 0.65)',
  defaultPlaceholderText: '#A9A9A9', // Fallback for placeholder
  defaultOnPrimary: '#FFFFFF', // Fallback for onPrimary
};

// Define default design system values locally
const defaultDs = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  typography: {
    fontSize: { sm: 14, md: 16, lg: 18, xl: 22 },
    fontFamily: { regular: 'System', medium: 'System', bold: 'System' },
    lineHeight: { md: 24 }
  },
  radii: { sm: 4, md: 8, lg: 12, xl: 16 },
};


const InputDialog: React.FC<InputDialogProps> = ({
  visible,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  keyboardType = 'default',
  maxLength,
  onCancel,
  onSubmit,
  cancelText = 'Cancelar',
  submitText = 'Salvar',
  theme: propTheme,
  autoCapitalize = 'none',
  secureTextEntry = false,
}) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  const [inputValue, setInputValue] = useState(defaultValue);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputRef = useRef<TextInput>(null);

  // Use local defaults as theme structure for these is not as expected
  const spacing = defaultDs.spacing;
  const typography = defaultDs.typography;
  const radii = defaultDs.radii;


  useEffect(() => {
    if (visible) {
      setInputValue(defaultValue);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]).start();

      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
        const announcement = `${title}. ${message || ''}. Digite sua resposta.`;
        AccessibilityInfo.announceForAccessibility(announcement);
      }, 300);

      return () => clearTimeout(focusTimer);
    } else {
       // Reset animations when dialog is hidden
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, defaultValue, title, message, fadeAnim, scaleAnim]);

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
    ]).start(callback);
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    animateOut(onCancel);
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    animateOut(() => onSubmit(inputValue));
  };

  if (!visible) return null; // Simplified visibility check

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleCancel} accessibilityLabel="Fechar diálogo">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kavContainer}
        >
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
              <Animated.View
                style={[
                  styles.dialogView,
                  {
                    backgroundColor: theme.colors.card,
                    transform: [{ scale: scaleAnim }],
                    padding: spacing.lg, // Use resolved spacing
                    borderRadius: radii.xl, // Use resolved radii
                  },
                ]}
                accessibilityRole="alert"
                accessibilityLabel={title}
                accessibilityHint={message}
                accessibilityViewIsModal
              >
                <View style={[styles.titleWrapper, { marginBottom: spacing.md }]}>
                  <Text style={[styles.titleText, { color: theme.colors.text, fontSize: typography.fontSize.xl, fontFamily: typography.fontFamily.bold, marginBottom: spacing.sm }]}>
                    {title}
                  </Text>
                  {message && (
                    <Text style={[styles.messageText, { color: theme.colors.textSecondary, fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.regular, lineHeight: typography.lineHeight.md, marginBottom: spacing.lg }]}>
                      {message}
                    </Text>
                  )}
                </View>

                <TextInput
                  ref={inputRef}
                  style={[
                    styles.textInputStyle,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background, // Fallback for inputBackground
                      borderRadius: radii.md, // Use resolved radii
                      paddingVertical: spacing.sm, // Use resolved spacing
                      paddingHorizontal: spacing.md, // Use resolved spacing
                      fontSize: typography.fontSize.md, // Use resolved typography
                      fontFamily: typography.fontFamily.regular, // Use resolved typography
                      marginBottom: spacing.xl, // Use resolved spacing
                    },
                  ]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={placeholder}
                  placeholderTextColor={theme.colors.textSecondary || componentColors.defaultPlaceholderText} // Fallback for placeholder color
                  keyboardType={keyboardType}
                  maxLength={maxLength}
                  autoCapitalize={autoCapitalize}
                  secureTextEntry={secureTextEntry}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel={placeholder || 'Campo de entrada'}
                  autoFocus={false}
                  selectionColor={theme.colors.primary}
                  underlineColorAndroid="transparent"
                />

                <View style={[styles.buttonsWrapper, { marginTop: spacing.sm }]}>
                  <Button
                    title={cancelText}
                    onPress={handleCancel}
                    type="outline"
                    size="sm"
                    buttonStyle={[styles.buttonStyle, { marginRight: spacing.md, borderColor: theme.colors.border }]}
                    titleStyle={{ color: theme.colors.text }}
                    accessibilityLabel={`Cancelar ação ${title}`}
                    accessibilityRole="button"
                  />
                  <Button
                    title={submitText}
                    onPress={handleSubmit}
                    size="sm"
                    buttonStyle={[styles.buttonStyle, styles.submitButtonStyle, { backgroundColor: theme.colors.primary }]}
                    titleStyle={{ color: theme.colors.primary === componentColors.defaultOnPrimary ? theme.colors.background : componentColors.defaultOnPrimary }} // Fallback for onPrimary
                    accessibilityLabel={`Confirmar ação ${title}`}
                    accessibilityRole="button"
                    disabled={inputValue.trim() === '' && !defaultValue}
                  />
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 8, // Example, consider using radii.md
    paddingHorizontal: 12, // Example, consider using spacing.md
    paddingVertical: 8,    // Example, consider using spacing.sm
  },
  buttonsWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogView: {
    elevation: 10,
    maxWidth: 400,
    shadowColor: componentColors.shadowBlack,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    width: '100%',
  },
  kavContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  messageText: {
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: componentColors.overlayBackground,
    justifyContent: 'center',
    padding: 16, // Example, consider using spacing.lg
  },
  submitButtonStyle: {
    minWidth: 90,
  },
  textInputStyle: {
    borderWidth: 1,
    width: '100%',
  },
  titleText: {
    textAlign: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
  },
});

export default InputDialog;
