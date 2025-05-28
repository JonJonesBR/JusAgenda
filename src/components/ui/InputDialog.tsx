import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput, // Keep TextInput
  StyleSheet,
  Modal,
  // TouchableOpacity, // Removed unused import
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  TextInputProps // Import TextInputProps
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '@rneui/themed';

interface InputDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  initialValue?: string;
  placeholder?: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
  submitText?: string;
  cancelText?: string;
  keyboardType?: TextInputProps['keyboardType']; // Use imported TextInputProps
  maxLength?: number;
  secureTextEntry?: boolean;
}

const InputDialog: React.FC<InputDialogProps> = ({
  visible,
  title,
  message,
  initialValue = '',
  placeholder,
  onCancel,
  onSubmit,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  keyboardType = 'default',
  maxLength,
  secureTextEntry = false,
}) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setInputValue(initialValue);
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(`${title}. Diálogo de entrada aberto.`);
      }, 200);
    }
  }, [visible, initialValue, title]);

  const handleSubmit = () => {
    onSubmit(inputValue);
  };

  const componentStyles = StyleSheet.create({
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.sm,
    },
    buttonSpacing: {
        marginLeft: theme.spacing.sm,
    },
    dialogContainer: { // Corrected order: 'dialogContainer' before 'input', 'message', 'modalOverlay', 'title'
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      maxWidth: 400, // Corrected order: 'maxWidth' before 'padding'
      padding: theme.spacing.lg,
      width: '100%',
      ...theme.shadows.large,
    },
    input: {
      backgroundColor: theme.colors.inputBackground,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.md,
      height: theme.components.input.height, // Corrected order: 'height' before 'marginBottom'
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    message: {
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.md,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    modalOverlay: {
      alignItems: 'center',
      backgroundColor: theme.colors.overlay,
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
      animationType="fade"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={componentStyles.modalOverlay}
      >
        <View style={componentStyles.dialogContainer}>
          <Text style={componentStyles.title}>{title}</Text>
          {message && <Text style={componentStyles.message}>{message}</Text>}
          <TextInput
            style={componentStyles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType={keyboardType}
            maxLength={maxLength}
            secureTextEntry={secureTextEntry}
            autoFocus={Platform.OS !== 'web'}
            onSubmitEditing={handleSubmit}
          />
          <View style={componentStyles.buttonContainer}>
            <Button
              title={cancelText}
              onPress={onCancel}
              type="outline"
              buttonStyle={{ borderColor: theme.colors.border }}
              titleStyle={{ color: theme.colors.textSecondary }}
            />
            <Button
              title={submitText}
              onPress={handleSubmit}
              buttonStyle={[{ backgroundColor: theme.colors.primary }, componentStyles.buttonSpacing]}
              titleStyle={{color: theme.colors.onPrimary}}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default InputDialog;
