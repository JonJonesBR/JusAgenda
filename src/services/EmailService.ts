import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import type { Event } from '../types/event'; // Using Event type from ../types/event
import { formatDate } from "../utils/dateUtils"; // Assuming formatDate is the primary export

const EMAIL_SUBJECT_SYNC = 'Sincronização de Compromissos JusAgenda';
const EMAIL_GREETING = 'Olá,';
const EMAIL_BODY_INTRO_SYNC = 'Aqui estão seus compromissos sincronizados do JusAgenda:';
const EMAIL_SIGNATURE = '\n\nAtenciosamente,\nEquipe JusAgenda';

interface ServiceResult {
  success: boolean;
  message?: string;
  error?: string;
  filePath?: string;
}

// Auxiliary validation function (can be moved to utils if used elsewhere)
const validateEmailLocal = (emailToValidate: string): boolean => {
    if (!emailToValidate) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(emailToValidate).toLowerCase());
};

const EmailService = {
  isAvailable: async (): Promise<boolean> => {
    try {
        return await Linking.canOpenURL('mailto:');
    } catch (error) {
        console.error("Erro ao verificar disponibilidade de mailto:", error);
        return false;
    }
  },

  syncEventsViaEmail: async (events: Event[], recipientEmail: string): Promise<ServiceResult> => {
    if (!recipientEmail || !validateEmailLocal(recipientEmail)) {
      return { success: false, error: 'Endereço de email do destinatário inválido ou não fornecido.' };
    }

    if (!events || events.length === 0) {
      return { success: false, error: 'Nenhum evento selecionado para sincronizar.' };
    }

    const eventListText = events.map(event => {
        const eventDate = event.data ? new Date(event.data) : null;
        const formattedDateTime = eventDate ? `${formatDate(eventDate)}` : 'Data/Hora não definida'; // Simplified, formatDate might need specific format string

        let details = `\n- *${event.title || 'Compromisso Sem Título'}*\n`; // Use title
        details += `  📅 ${formattedDateTime}\n`;
        if (event.tipo) details += `  🏷️ Tipo: ${event.tipo.charAt(0).toUpperCase() + event.tipo.slice(1)}\n`; // Use tipo
        if (event.cliente) details += `  👤 Cliente: ${event.cliente}\n`; // Use cliente
        if (event.local) details += `  📍 Local: ${event.local}\n`; // Use local
        if (event.numeroProcesso) details += `  🔢 Processo: ${event.numeroProcesso}\n`;
        if (event.descricao) details += `  📝 Descrição: ${event.descricao}\n`; // Use descricao
        return details;
    }).join('');

    const body = `${EMAIL_GREETING}\n\n${EMAIL_BODY_INTRO_SYNC}\n${eventListText}\n${EMAIL_SIGNATURE}`;
    const encodedSubject = encodeURIComponent(EMAIL_SUBJECT_SYNC);
    const encodedBody = encodeURIComponent(body);
    const emailUrl = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (!supported) {
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de email.');
        return { success: false, error: 'Aplicativo de email não disponível ou não suporta o link.' };
      } else {
        await Linking.openURL(emailUrl);
        return { success: true, message: 'Aplicativo de email aberto para envio.' };
      }
    } catch (error: unknown) {
      console.error('Erro ao abrir link mailto:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir o aplicativo de email.');
      return { success: false, error: `Erro ao abrir email: ${message}` };
    }
  },

  configureEmailAlert: async (event: Event, recipientEmail: string, minutesBefore: number): Promise<ServiceResult> => {
    console.log(`Placeholder: Configurar alerta para "${event.title}" ${minutesBefore} min antes para ${recipientEmail}.`);

    if (!recipientEmail || !validateEmailLocal(recipientEmail)) {
      return { success: false, error: 'Endereço de email inválido.' };
    }
    if (!event || !event.data) { // Use data
        return { success: false, error: 'Dados do evento inválidos para criar alerta.'}
    }

    Alert.alert(
      "Alerta por Email (Em Desenvolvimento)",
      "Esta funcionalidade requer um servidor para enviar emails agendados e não está implementada.\n\nComo alternativa, considere adicionar este evento ao seu calendário manualmente."
    );
    return { success: false, message: 'Configuração de alerta por email não implementada.' };
  },
};

export default EmailService;
