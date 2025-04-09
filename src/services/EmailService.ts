import * as MailComposer from "expo-mail-composer";
import moment from "moment";

interface EmailEvent {
  id: string;
  title: string;
  date: string | Date;
  location?: string;
  description?: string;
  type?: string;
}

class EmailService {
  /**
   * Verifica se o envio de emails está disponível no dispositivo.
   *
   * @returns {Promise<boolean>} Retorna true se o envio de emails estiver disponível.
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      return isAvailable;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade de email:", error);
      return false;
    }
  }

  /**
   * Envia um email de lembrete para um compromisso.
   *
   * @param {Object} event - O compromisso para o qual enviar o lembrete.
   * @param {string} recipientEmail - Email do destinatário.
   * @returns {Promise<Object>} Resultado da operação.
   */
  static async sendEventReminder(
    event: EmailEvent,
    recipientEmail: string
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      if (!recipientEmail) {
        throw new Error("Email do destinatário não fornecido");
      }

      const dateFormatted = moment(event.date).format("DD/MM/YYYY");
      const timeFormatted = moment(event.date).format("HH:mm");

      const result = await MailComposer.composeAsync({
        recipients: [recipientEmail],
        subject: `Lembrete: ${event.title}`,
        body: `
        <h2>Lembrete de Compromisso</h2>
        <p><strong>Título:</strong> ${event.title}</p>
        <p><strong>Data:</strong> ${dateFormatted}</p>
        <p><strong>Horário:</strong> ${timeFormatted}</p>
        ${
          event.location
            ? `<p><strong>Local:</strong> ${event.location}</p>`
            : ""
        }
        ${
          event.description
            ? `<p><strong>Descrição:</strong> ${event.description}</p>`
            : ""
        }
        
        <p>Este é um lembrete automático enviado pelo JusAgenda.</p>
        `,
        isHtml: true,
      });

      return { success: result.status === "sent", result };
    } catch (error) {
      console.error("Erro ao enviar email de lembrete:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sincroniza múltiplos compromissos via email, enviando um resumo.
   *
   * @param {Array} events - Lista de compromissos para sincronizar.
   * @param {string} recipientEmail - Email do destinatário.
   * @returns {Promise<Object>} Resultado da operação.
   */
  static async syncEventsViaEmail(
    events: EmailEvent[],
    recipientEmail: string
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      if (!recipientEmail) {
        throw new Error("Email do destinatário não fornecido");
      }

      if (!events || events.length === 0) {
        throw new Error("Nenhum compromisso para sincronizar");
      }

      const eventsHTML = events
        .map(
          (event) => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h3 style="color: #34495e; margin-bottom: 10px;">${event.title}</h3>
          <p><strong>Data:</strong> ${moment(event.date).format(
            "DD/MM/YYYY"
          )}</p>
          <p><strong>Horário:</strong> ${moment(event.date).format("HH:mm")}</p>
          ${
            event.location
              ? `<p><strong>Local:</strong> ${event.location}</p>`
              : ""
          }
          ${
            event.description
              ? `<p><strong>Descrição:</strong> ${event.description}</p>`
              : ""
          }
          ${
            event.type
              ? `<p><strong>Tipo:</strong> ${
                  event.type.charAt(0).toUpperCase() + event.type.slice(1)
                }</p>`
              : ""
          }
        </div>
      `
        )
        .join("");

      const result = await MailComposer.composeAsync({
        recipients: [recipientEmail],
        subject: `Sincronização de Compromissos - JusAgenda`,
        body: `
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Seus Compromissos</h2>
        <p>Aqui está a lista de compromissos sincronizada do JusAgenda:</p>
        
        ${eventsHTML}
        
        <p style="margin-top: 30px; font-style: italic;">Este email foi enviado automaticamente pelo JusAgenda.</p>
        `,
        isHtml: true,
      });

      return { success: result.status === "sent", result };
    } catch (error) {
      console.error("Erro ao sincronizar compromissos via email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Configura alertas por email para um compromisso específico.
   *
   * @param {Object} event - O compromisso para configurar o alerta.
   * @param {string} recipientEmail - Email do destinatário.
   * @param {number} minutesBefore - Minutos antes do compromisso para enviar o lembrete.
   * @returns {Promise<Object>} Dados de configuração do alerta.
   */
  static async configureEmailAlert(
    event: EmailEvent,
    recipientEmail: string,
    minutesBefore: number
  ): Promise<{ success: boolean; alertConfig?: any; message?: string; error?: string }> {
    try {
      if (!event || !event.id) {
        throw new Error("Compromisso inválido");
      }

      if (!recipientEmail) {
        throw new Error("Email do destinatário não fornecido");
      }

      // Armazena a configuração para processamento posterior
      // (em uma aplicação real, isso seria armazenado em um banco de dados)
      const alertConfig = {
        eventId: event.id,
        recipientEmail,
        minutesBefore,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Em uma aplicação real, você implementaria uma lógica
      // para agendar o envio do email no momento apropriado

      return {
        success: true,
        alertConfig,
        message: `Alerta por email configurado para ${minutesBefore} minutos antes do compromisso`,
      };
    } catch (error) {
      console.error("Erro ao configurar alerta por email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export default EmailService;
