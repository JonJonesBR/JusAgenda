// src/services/EmailService.ts
import { Linking, Alert, Platform } from 'react-native';
import qs from 'qs'; // Para construir query strings de URL de forma segura
import _ from 'lodash'; // Usado para isNil e isEmpty
import { Event as EventType } from '../types/event';
import { Toast } from '../components/ui/Toast';
// import { formatDate, formatTime } from '../utils/dateUtils'; // Se precisar formatar datas/horas para o corpo do email

interface EmailRecipient {
  email: string;
  name?: string; // Nome opcional para o destinatário
}

interface EmailOptions {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  body: string;
  isHtml?: boolean; // Se o corpo do email é HTML
}

interface ServiceResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Verifica se o dispositivo pode abrir URLs de email (mailto).
 * @returns Promise<boolean> True se puder abrir, false caso contrário.
 */
async function isEmailClientAvailable(): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL('mailto:');
    return canOpen;
  } catch (error) {
    console.error('EmailService: Erro ao verificar disponibilidade de cliente de email:', error);
    return false;
  }
}

/**
 * Envia um email usando o cliente de email padrão do dispositivo.
 * @param options - As opções do email (destinatários, assunto, corpo).
 * @returns Promise<ServiceResult> Indicando sucesso ou falha.
 */
export async function sendEmail(options: EmailOptions): Promise<ServiceResult> {
  if (!options.to || options.to.length === 0 || !options.to.every(r => r.email && isValidEmail(r.email))) {
    Toast.show({ type: 'error', text1: 'Erro de Email', text2: 'Destinatário inválido ou ausente.' });
    return { success: false, error: 'Destinatário inválido ou ausente.' };
  }
  if (!options.subject) {
    Toast.show({ type: 'error', text1: 'Erro de Email', text2: 'Assunto do email é obrigatório.' });
    return { success: false, error: 'Assunto do email é obrigatório.' };
  }

  const available = await isEmailClientAvailable();
  if (!available) {
    Toast.show({ type: 'error', text1: 'Cliente de Email Indisponível', text2: 'Nenhum aplicativo de email encontrado.' });
    Alert.alert(
      'Cliente de Email Indisponível',
      'Não foi possível encontrar um aplicativo de email no seu dispositivo. Por favor, instale e configure um.'
    );
    return { success: false, error: 'Nenhum cliente de email disponível.' };
  }

  const toEmails = options.to.map(r => r.email).join(',');
  const ccEmails = options.cc?.map(r => r.email).join(',');
  const bccEmails = options.bcc?.map(r => r.email).join(',');

  const queryParams: Record<string, string> = {};
  if (ccEmails) queryParams.cc = ccEmails;
  if (bccEmails) queryParams.bcc = bccEmails;
  queryParams.subject = options.subject;
  queryParams.body = options.body; // O corpo é melhor tratado pelo cliente de email

  // Monta a URL mailto
  // A codificação do corpo pode ser problemática e é melhor deixar para o cliente.
  // Alguns clientes lidam melhor com o corpo diretamente na URL, outros não.
  // A forma mais segura é apenas assunto e destinatários.
  let url = `mailto:${toEmails}`;
  const queryString = qs.stringify(queryParams, { encode: true }); // qs lida com a codificação

  if (queryString) {
    url += `?${queryString}`;
  }

  // Limite de comprimento de URL: URLs mailto muito longas (especialmente com corpo grande) podem falhar.
  // O limite varia entre plataformas e clientes de email.
  const MAX_URL_LENGTH = Platform.OS === 'ios' ? 2000 : 8000; // Valores aproximados
  if (url.length > MAX_URL_LENGTH) {
    console.warn('EmailService: URL do mailto é muito longa, tentando versão simplificada.');
    // Tenta uma versão mais curta sem o corpo, se o corpo for o culpado.
    const simplifiedQueryParams: Record<string, string> = { subject: options.subject };
    if (ccEmails) simplifiedQueryParams.cc = ccEmails;
    if (bccEmails) simplifiedQueryParams.bcc = bccEmails;
    const simplifiedQueryString = qs.stringify(simplifiedQueryParams);
    url = `mailto:${toEmails}${simplifiedQueryString ? `?${simplifiedQueryString}` : ''}`;

    if (url.length > MAX_URL_LENGTH) {
        Toast.show({ type: 'error', text1: 'Erro de Email', text2: 'Os dados do email são muito longos.' });
        return { success: false, error: 'Dados do email (assunto/destinatários) muito longos para URL mailto.' };
    }
    Alert.alert("Aviso", "O corpo do email foi omitido devido ao seu tamanho. Por favor, adicione-o manualmente no seu cliente de email.");
  }


  try {
    await Linking.openURL(url);
    Toast.show({ type: 'success', text1: 'Cliente de Email Aberto', text2: 'Prossiga com o envio no seu app de email.' });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('EmailService: Erro ao tentar abrir URL mailto:', message, 'URL:', url);
    Toast.show({ type: 'error', text1: 'Erro ao Abrir Email', text2: 'Não foi possível abrir o cliente de email.' });
    // Fallback para uma URL mais simples se a primeira tentativa falhar (raro se canOpenURL passou)
    try {
      const simplerUrl = `mailto:${toEmails}?subject=${encodeURIComponent(options.subject)}`;
      await Linking.openURL(simplerUrl);
      Toast.show({ type: 'success', text1: 'Cliente de Email Aberto', text2: 'Prossiga com o envio no seu app de email.' });
      return { success: true };
    } catch (fallbackError: unknown) {
      const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Erro desconhecido no fallback';
      console.error('EmailService: Erro no fallback ao abrir URL mailto:', fallbackMessage);
      Toast.show({ type: 'error', text1: 'Erro Crítico de Email', text2: 'Falha ao abrir o cliente de email.' });
      return { success: false, error: `Falha ao abrir cliente de email: ${fallbackMessage}` };
    }
  }
}

/**
 * Configura um alerta por email para um evento específico.
 * Atualmente, esta é uma funcionalidade placeholder.
 * @param event - O evento para o qual configurar o alerta.
 * @param userEmail - O email do usuário para receber o alerta.
 * @param minutesBefore - Quantos minutos antes do evento o alerta deve ser enviado.
 */
export function configureEmailAlert(
  event: EventType | undefined | null,
  userEmail: string | undefined | null,
  minutesBefore: number | undefined | null
): ServiceResult {
  if (_.isNil(event) || _.isEmpty(event.title) || _.isEmpty(event.data)) {
    Toast.show({ type: 'error', text1: 'Dados Inválidos', text2: 'Evento inválido para alerta.' });
    return { success: false, error: 'Evento inválido para configurar alerta.' };
  }
  if (_.isNil(userEmail) || _.isEmpty(userEmail) || !isValidEmail(userEmail)) {
    Toast.show({ type: 'error', text1: 'Dados Inválidos', text2: 'Email do usuário inválido.' });
    return { success: false, error: 'Email do usuário inválido para alerta.' };
  }
  if (_.isNil(minutesBefore) || minutesBefore < 0) {
    Toast.show({ type: 'error', text1: 'Dados Inválidos', text2: 'Tempo de antecedência inválido.' });
    return { success: false, error: 'Tempo de antecedência inválido para alerta.' };
  }

  // Lógica para agendar o envio do email (ex: usando um backend ou serviço de agendamento)
  // Esta é uma implementação placeholder.
  const message = `Configurar alerta por email para o evento "${event.title}" em ${event.data}, ${minutesBefore} minutos antes, para ${userEmail}.`;
  console.log('EmailService: configureEmailAlert - ', message);
  Alert.alert('Funcionalidade Futura', 'A configuração de alertas por email será implementada em uma versão futura.');
  Toast.show({ type: 'info', text1: 'Funcionalidade Futura', text2: 'Alertas por email em breve!' });
  return { success: true, data: { message: 'Configuração de alerta por email é uma funcionalidade futura.' } };
}

/**
 * Valida um endereço de email.
 * @param email - O email a ser validado.
 * @returns True se o email for válido, false caso contrário.
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false;
  }
  // Regex simples para validação de email. Para uma validação mais robusta, considere bibliotecas.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Para verificar disponibilidade de forma síncrona (ex: para UI inicial)
// Nota: `Linking.canOpenURL` é assíncrono, então uma verificação verdadeiramente síncrona
// da capacidade de abrir mailto não é possível. Esta função é um placeholder ou
// precisaria de uma estratégia diferente (ex: cachear o resultado de uma chamada assíncrona).
// Por enquanto, vamos manter a verificação assíncrona como a principal.
/*
let _isMailClientAvailable: boolean | null = null;
export async function checkMailAvailability() {
  _isMailClientAvailable = await isEmailClientAvailable();
}
// Chamar checkMailAvailability() no início do app.

export function isMailAvailableSync(): boolean {
  if (_isMailClientAvailable === null) {
    console.warn("EmailService: isMailAvailableSync chamado antes de checkMailAvailability completar.");
    return false; // Ou true, dependendo da sua preferência de fallback
  }
  return _isMailClientAvailable;
}
*/

export default {
  sendEmail,
  configureEmailAlert,
  isValidEmail,
  isEmailClientAvailable, // Exportando a função assíncrona de verificação
};
