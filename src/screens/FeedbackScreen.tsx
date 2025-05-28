// src/screens/FeedbackScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';
import * as MailComposer from 'expo-mail-composer';
import { Formik, FormikHelpers } from 'formik'; // Usando Formik para gestão do formulário

import { useTheme } from '../contexts/ThemeContext';
import { Header, Input, Button } from '../components/ui';
import { Toast } from '../components/ui/Toast';
import { ROUTES } from '../constants';
// Assumindo que FeedbackScreen pode estar em qualquer stack, ou numa stack de "Mais" ou "Perfil"
// Por agora, usaremos uma ParamList genérica ou específica se soubermos onde ela reside.
// import { RootStackParamList } from '../navigation/AppNavigator'; // Exemplo
type FeedbackScreenNavigationProp = StackNavigationProp<any, typeof ROUTES.FEEDBACK>; // Use any por agora

interface FeedbackFormValues {
  name: string;
  email: string; // Email do remetente (opcional, mas bom para resposta)
  subject: string;
  feedback: string;
  appVersion?: string; // Opcional: incluir versão do app
}

const feedbackSchema = Yup.object().shape({
  name: Yup.string().required('O seu nome é obrigatório.'),
  email: Yup.string().email('Email inválido.').required('O seu email é obrigatório para que possamos responder.'),
  subject: Yup.string().required('O assunto é obrigatório.').min(5, 'Assunto muito curto.'),
  feedback: Yup.string().required('A sua mensagem de feedback é obrigatória.').min(10, 'Mensagem de feedback muito curta.'),
  appVersion: Yup.string().optional(),
});

// Email de destino para o feedback
const FEEDBACK_RECIPIENT_EMAIL = 'suporte@jusagenda.com.br'; // SUBSTITUA PELO SEU EMAIL REAL

const FeedbackScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<FeedbackScreenNavigationProp>();
  const [isMailAvailable, setIsMailAvailable] = useState(false);
  const [isCheckingMail, setIsCheckingMail] = useState(true);

  useEffect(() => {
    const checkMail = async () => {
      setIsCheckingMail(true);
      const available = await MailComposer.isAvailableAsync();
      setIsMailAvailable(available);
      setIsCheckingMail(false);
      if (!available && Platform.OS !== 'web') { // Na web, mailto: pode funcionar mesmo assim
        Alert.alert(
          'Cliente de Email Indisponível',
          'Não foi possível encontrar um aplicativo de email configurado no seu dispositivo. Por favor, configure um para enviar feedback.'
        );
      }
    };
    checkMail();
  }, []);

  const initialFormValues: FeedbackFormValues = {
    name: '',
    email: '',
    subject: 'Feedback sobre o App JusAgenda',
    feedback: '',
    appVersion: Platform.OS === 'ios' ? '1.0.0 (iOS)' : '1.0.0 (Android)', // Obter dinamicamente
  };

  const handleSubmitFeedback = async (
    values: FeedbackFormValues,
    formikActions: FormikHelpers<FeedbackFormValues>
  ) => {
    if (!isMailAvailable && Platform.OS !== 'web') {
      Alert.alert('Cliente de Email Indisponível', 'Configure um cliente de email para enviar feedback.');
      formikActions.setSubmitting(false);
      return;
    }

    const mailOptions: MailComposer.MailComposerOptions = {
      recipients: [FEEDBACK_RECIPIENT_EMAIL],
      subject: `[Feedback JusAgenda] ${values.subject}`,
      body: `Nome: ${values.name}\nEmail para Contato: ${values.email}\n\nFeedback:\n${values.feedback}\n\n------------------\nVersão do App: ${values.appVersion}\nPlataforma: ${Platform.OS}`,
      // isHtml: false, // Opcional
    };

    try {
      const result = await MailComposer.composeAsync(mailOptions);
      // console.log('MailComposer result:', result);
      if (result.status === MailComposer.MailComposerStatus.SENT) {
        Toast.show({ type: 'success', text1: 'Feedback Enviado!', text2: 'Obrigado pela sua contribuição.' });
        navigation.goBack();
      } else if (result.status === MailComposer.MailComposerStatus.SAVED) {
        Toast.show({ type: 'info', text1: 'Rascunho Salvo', text2: 'O seu feedback foi salvo como rascunho no seu app de email.' });
      } else if (result.status === MailComposer.MailComposerStatus.CANCELLED) {
        Toast.show({ type: 'info', text1: 'Envio Cancelado', text2: 'O envio do feedback foi cancelado.' });
      }
      // MailComposer.MailComposerStatus.UNDETERMINED (iOS) ou se o app de email não retornar status
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error("FeedbackScreen: Erro ao compor email:", error);
      Toast.show({ type: 'error', text1: 'Erro ao Enviar', text2: `Não foi possível abrir o cliente de email: ${message}` });
    } finally {
      formikActions.setSubmitting(false);
    }
  };

  if (isCheckingMail) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header title="Enviar Feedback" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Ajuste conforme altura do header
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { padding: theme.spacing.md }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.introText, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, marginBottom: theme.spacing.lg }]}>
            A sua opinião é muito importante para nós! Use o formulário abaixo para enviar sugestões, reportar problemas ou simplesmente partilhar a sua experiência.
          </Text>

          <Formik
            initialValues={initialFormValues}
            validationSchema={feedbackSchema}
            onSubmit={handleSubmitFeedback}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, dirty, isValid }) => (
              <>
                <Input
                  label="Seu Nome *"
                  placeholder="Como podemos chamar você?"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && errors.name}
                  containerStyle={styles.inputSpacing}
                />
                <Input
                  label="Seu Email para Contato *"
                  placeholder="Para podermos responder, se necessário"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={styles.inputSpacing}
                />
                <Input
                  label="Assunto *"
                  placeholder="Sobre o que é o seu feedback?"
                  value={values.subject}
                  onChangeText={handleChange('subject')}
                  onBlur={handleBlur('subject')}
                  error={touched.subject && errors.subject}
                  containerStyle={styles.inputSpacing}
                />
                <Input
                  label="Sua Mensagem de Feedback *"
                  placeholder="Descreva aqui a sua opinião..."
                  value={values.feedback}
                  onChangeText={handleChange('feedback')}
                  onBlur={handleBlur('feedback')}
                  error={touched.feedback && errors.feedback}
                  multiline
                  numberOfLines={5}
                  inputStyle={{ height: 120, textAlignVertical: 'top' }}
                  containerStyle={styles.inputSpacing}
                />
                <Button
                  title="Enviar Feedback"
                  onPress={() => handleSubmit()} // handleSubmit do Formik
                  loading={isSubmitting}
                  disabled={isSubmitting || !dirty || !isValid || (!isMailAvailable && Platform.OS !== 'web')}
                  type="solid"
                  icon="email-send-outline"
                  buttonStyle={{ marginTop: theme.spacing.md }}
                />
                {!isMailAvailable && Platform.OS !== 'web' && (
                    <Text style={[styles.warningText, {color: theme.colors.warning, fontFamily: theme.typography.fontFamily.regular}]}>
                        Cliente de email não disponível. Por favor, configure um app de email.
                    </Text>
                )}
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1, // Para o ScrollView ocupar o espaço e o KeyboardAvoidingView funcionar bem
    // padding é definido dinamicamente
  },
  introText: {
    fontSize: 15, // Usar theme.typography
    lineHeight: 22, // Usar theme.typography
    textAlign: 'left',
    // marginBottom e color são dinâmicos
  },
  inputSpacing: {
    // marginBottom: 16, // O Input já tem marginBottom
  },
  warningText: {
    fontSize: 13, // Usar theme.typography.fontSize.xs
    textAlign: 'center',
    marginTop: 12, // Usar theme.spacing.sm
  },
});

export default FeedbackScreen;
