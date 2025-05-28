import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import _ from 'lodash'; // Esta linha deve estar correta
import Toast from 'react-native-toast-message';

interface SendEmailParams {
  to?: string | string[];
  subject?: string;
  body?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export const sendEmail = async ({
  to,
  subject = 'Contato via App JusAgenda',
  body = '',
  cc,
  bcc,
}: SendEmailParams): Promise<void> => {
  let recipients = '';
  if (to) {
    recipients = Array.isArray(to) ? to.join(',') : to;
  }

  let mailtoUrl = `mailto:${recipients}`;
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  if (cc) params.push(`cc=${encodeURIComponent(Array.isArray(cc) ? cc.join(',') : cc)}`);
  if (bcc) params.push(`bcc=${encodeURIComponent(Array.isArray(bcc) ? bcc.join(',') : bcc)}`);

  if (params.length > 0) {
    mailtoUrl += `?${params.join('&')}`;
  }

  try {
    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    } else {
      const simplerMailtoUrl = `mailto:${recipients}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
      const canOpenSimpler = await Linking.canOpenURL(simplerMailtoUrl);
      if (canOpenSimpler) {
        await Linking.openURL(simplerMailtoUrl);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Não foi possível abrir o app de e-mail',
          text2: 'Por favor, verifique se você tem um cliente de e-mail configurado.',
        });
      }
    }
  } catch (error) {
    console.error('Erro ao tentar abrir o cliente de e-mail:', error);
    Toast.show({
      type: 'error',
      text1: 'Erro ao abrir e-mail',
      text2: 'Ocorreu um problema inesperado.',
    });
  }
};

export const configureEmailAlert = (eventId: string, userEmail: string, reminderTime: number): void => {
  if (_.isNil(eventId) || _.isEmpty(eventId) || _.isNil(userEmail) || _.isEmpty(userEmail) || _.isNil(reminderTime)) {
    console.warn('configureEmailAlert: Parâmetros inválidos recebidos.');
    Toast.show({
      type: 'error',
      text1: 'Dados Inválidos',
      text2: 'Não foi possível configurar o alerta de e-mail.',
    });
    return;
  }

  console.log(
    `Tentativa de configurar alerta de e-mail para o evento ${eventId}, para ${userEmail}, ${reminderTime} minutos antes.`
  );

  Alert.alert(
    'Funcionalidade Futura',
    'A configuração de alertas de e-mail automáticos requer um serviço de backend que ainda não está implementado. Esta funcionalidade estará disponível em versões futuras.',
    [{ text: 'Entendi' }]
  );
};

export const isValidEmail = (email: string): boolean => {
  if (_.isNil(email) || _.isEmpty(email)) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
