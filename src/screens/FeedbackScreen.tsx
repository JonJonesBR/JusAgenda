import React, { useState } from 'react';
import {
  StyleSheet,
  Alert,
  Keyboard,
  ScrollView,
  Text,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Button, Input, Card, Icon } from '@rneui/themed'; // Added Icon
import * as MailComposer from 'expo-mail-composer';
import * as yup from 'yup';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const feedbackSchema = yup.object().shape({
  email: yup.string().email('E-mail inválido').trim().nullable().transform(v => v === '' ? null : v),
  feedback: yup.string().trim().required('O feedback não pode ficar em branco.'),
});

// Define default design system values locally
const defaultDs = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  typography: {
    fontSize: { sm: 14, md: 16, lg: 18, xl: 22 },
    fontFamily: { regular: 'System', medium: 'System', bold: 'System' }
  },
  radii: { md: 8 },
};

const FeedbackScreen: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Use local defaults as theme structure for these is not as expected or might be missing
  const ds = {
    spacing: defaultDs.spacing,
    typography: defaultDs.typography,
    radii: defaultDs.radii,
  };

  const handleSend = async () => {
    Keyboard.dismiss();
    setIsSending(true);

    const sanitized = {
      email: email.trim() || undefined,
      feedback: feedback.trim(),
    };

    try {
      await feedbackSchema.validate(sanitized, { abortEarly: false });

      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
          Alert.alert('Erro', 'Não há um cliente de e-mail configurado neste dispositivo.');
          setIsSending(false);
          return;
      }

      const result = await MailComposer.composeAsync({
        recipients: ['jusagenda@suporte.com'],
        subject: 'Feedback - App JusAgenda',
        body: `Feedback do Usuário:\n--------------------\n${sanitized.feedback}\n--------------------\n\nEmail (opcional): ${sanitized.email || 'Não informado'}`,
      });

      if (result.status === 'sent' || result.status === 'saved') {
         Alert.alert('Feedback Enviado!', 'Obrigado pela sua contribuição.');
         setFeedback('');
         setEmail('');
      } else if (result.status === 'cancelled') {
         // Optional: console.log('Envio de feedback cancelado pelo usuário.');
      } else {
         Alert.alert('Status Desconhecido', 'Não foi possível determinar se o email foi enviado.');
      }

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        Alert.alert('Campos Inválidos', err.errors.join('\n'));
      } else {
        console.error("Erro ao enviar feedback:", err);
        Alert.alert('Erro', 'Não foi possível abrir o cliente de e-mail. Verifique suas configurações.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.kavContainer, { backgroundColor: theme.colors.background }]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
        <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + ds.spacing.lg }]}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={[styles.title, { color: theme.colors.text, fontSize: ds.typography.fontSize.xl, fontFamily: ds.typography.fontFamily.bold, marginBottom: ds.spacing.lg }]}>
                Envie seu Feedback
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: ds.typography.fontSize.md, fontFamily: ds.typography.fontFamily.regular, marginBottom: ds.spacing.xl }]}>
                Sua opinião é importante para nós! Use o campo abaixo para enviar sugestões, relatar problemas ou fazer comentários sobre o JusAgenda.
            </Text>

            <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderRadius: ds.radii.md }]}>
                <Input
                    placeholder="Seu e-mail (opcional)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    containerStyle={styles.inputContainer}
                    inputContainerStyle={styles.inputContainerStyleBorderless}
                    inputStyle={{ color: theme.colors.text, fontSize: ds.typography.fontSize.md }}
                    placeholderTextColor={theme.colors.textSecondary || componentColors.defaultPlaceholderText}
                    leftIcon={<Icon name="email-outline" type="material-community" color={theme.colors.textSecondary} />}
                    disabled={isSending}
                />

                <Input
                    placeholder="Digite seu feedback aqui... *"
                    value={feedback}
                    onChangeText={setFeedback}
                    multiline
                    numberOfLines={6}
                    containerStyle={styles.inputContainer}
                    inputContainerStyle={styles.multilineInputContainerStyle}
                    inputStyle={[styles.multilineInput, { color: theme.colors.text, fontSize: ds.typography.fontSize.md }]}
                    placeholderTextColor={theme.colors.textSecondary || componentColors.defaultPlaceholderText}
                    disabled={isSending}
                />
            </Card>

            <Button
                title="Enviar Feedback"
                onPress={handleSend}
                buttonStyle={{ backgroundColor: theme.colors.primary, borderRadius: ds.radii.md }}
                containerStyle={{ marginTop: ds.spacing.xl }}
                loading={isSending}
                disabled={isSending}
                icon={<Icon name="send-outline" type="material-community" color={componentColors.white} />}
                iconRight
            />
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

const componentColors = {
    white: '#FFFFFF',
    defaultPlaceholderText: '#A9A9A9', // Added for placeholder fallback
};

const styles = StyleSheet.create({
  card: {
      borderWidth: 0,
      elevation: 1,
      marginHorizontal: 0,
      padding: 10,
      shadowOpacity: 0.05,
  },
  inputContainer: {
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  inputContainerStyleBorderless: { // For email input
    borderBottomWidth: 0,
  },
  kavContainer: {
    flex: 1,
  },
  multilineInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  multilineInputContainerStyle: { // For feedback input
    borderBottomWidth: 0,
    height: 150,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  subtitle: {
      lineHeight: 22,
      textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
});

export default FeedbackScreen;
