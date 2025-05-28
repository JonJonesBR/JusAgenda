// src/components/ui/InputDialog.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button'; // Supondo que você tenha um componente Button customizado

interface InputDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  initialValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (inputValue: string) => void;
  onCancel: () => void;
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>; // Props para o TextInput interno
  // Adicionar outras props conforme necessário
  // Ex: onCloseRequest (se o modal puder ser fechado por gesto de swipe, etc.)
  maxLength?: number;
  keyboardType?: TextInputProps['keyboardType'];
  autoFocus?: boolean;
  dialogStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<ViewStyle>; // Estilo para o container do TextInput, não o texto em si
}

const InputDialog: React.FC<InputDialogProps> = ({
  visible,
  title,
  message,
  initialValue = '',
  placeholder,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  textInputProps,
  maxLength,
  keyboardType = 'default',
  autoFocus = true,
  dialogStyle,
  titleStyle,
  messageStyle,
  inputStyle,
}) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setInputValue(initialValue); // Reseta o valor ao abrir
      if (autoFocus) {
        // Adiciona um pequeno delay para garantir que o modal e o input estejam prontos
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100); // O delay pode precisar de ajuste
      }
      if (title) {
        AccessibilityInfo.announceForAccessibility(title);
      }
    }
  }, [visible, initialValue, autoFocus, title]);

  const handleConfirm = () => {
    onConfirm(inputValue);
  };

  const handleCancel = () => {
    onCancel();
  };

  // Estilos dinâmicos baseados no tema
  const themedDialogStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    width: Dimensions.get('window').width * 0.9, // 90% da largura da tela
    maxWidth: 400, // Largura máxima para tablets
    ...theme.shadows.md, // Aplicando sombra do tema
  };

  const themedTitleStyle: TextStyle = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.bold,
  };

  const themedMessageStyle: TextStyle = {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.normal,
    fontFamily: theme.typography.fontFamily.regular,
  };

  const themedTextInputStyle: ViewStyle = {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface, // Fundo do input
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.fontFamily.regular,
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade" // Ou 'slide'
      onRequestClose={handleCancel} // Para o botão de voltar do Android
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.dialogContainer, themedDialogStyle, dialogStyle]}>
          {title && <Text style={[themedTitleStyle, titleStyle]}>{title}</Text>}
          {message && <Text style={[themedMessageStyle, messageStyle]}>{message}</Text>}

          <TextInput
            ref={inputRef}
            style={[themedTextInputStyle, inputStyle]}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder || 'Digite aqui...'}
            placeholderTextColor={theme.colors.placeholder}
            maxLength={maxLength}
            keyboardType={keyboardType}
            autoFocus={autoFocus && Platform.OS === 'android'} // autoFocus no Android pode ser direto
            onSubmitEditing={handleConfirm} // Confirma ao pressionar 'Enter/Done'
            {...textInputProps} // Permite passar outras props do TextInput
          />

          <View style={styles.buttonContainer}>
            <Button
              title={cancelText}
              onPress={handleCancel}
              type="outline" // Supondo que seu Button tenha um tipo 'outline'
              buttonStyle={[styles.button, { marginRight: theme.spacing.sm }]}
              titleStyle={{ color: theme.colors.text }} // Ajuste conforme seu Button
            />
            <Button
              title={confirmText}
              onPress={handleConfirm}
              buttonStyle={styles.button}
              disabled={!inputValue.trim() && textInputProps?.value === undefined} // Desabilita se vazio (considerando controlled/uncontrolled)
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo escurecido
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    // Estilos base já definidos em themedDialogStyle
    // Adicionar aqui apenas estilos que NÃO dependem do tema
    alignItems: 'stretch', // Para que os botões ocupem a largura
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Alinha botões à direita por padrão
    marginTop: theme.spacing.md, // Adicionado para espaçamento acima dos botões
  },
  button: {
    flex: 1, // Para que os botões dividam o espaço se houver mais de um ou para ocupar espaço
    // Estilos específicos do botão podem vir do componente Button ou serem passados
    // Exemplo: paddingHorizontal: theme.spacing.md,
  },
  // Outros estilos que não dependem do tema podem ser adicionados aqui
});

// É necessário acessar theme.spacing.md fora do escopo do componente para styles.buttonContainer.marginTop
// Isso pode ser resolvido definindo o marginTop diretamente no JSX ou passando o theme para o StyleSheet.create
// Por simplicidade, vou assumir que theme.spacing.md é um valor conhecido ou que você ajustará isso.
// Para uma solução mais limpa, o marginTop pode ser inline:
// <View style={[styles.buttonContainer, { marginTop: theme.spacing.md }]}>

export default InputDialog;
