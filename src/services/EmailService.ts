import * as MailComposer from "expo-mail-composer";
import moment from "moment";
import { AppError, ERROR_CODES } from "../utils/AppError";
import { logger } from "../utils/loggerService";

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
   * @returns {Promise<{success: boolean, available?: boolean, error?: AppError}>} Resultado da verificação
   */
  static async isAvailable(): Promise<{ success: boolean; available?: boolean; error?: AppError }> {
    try {
      // Adiciona um timeout para evitar operações bloqueantes
      const availabilityPromise = Promise.race([
        MailComposer.isAvailableAsync(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao verificar disponibilidade de email")), 5000)
        )
      ]);

      const isAvailable = await availabilityPromise;
      logger.info(`Disponibilidade de email: ${isAvailable ? 'Sim' : 'Não'}`);
      
      return { success: true, available: isAvailable };
    } catch (error) {
      logger.error("Erro ao verificar disponibilidade de email", error);
      return {
        success: false,
        error: AppError.fromError(
          error,
          ERROR_CODES.EMAIL.VALIDATION,
          "Não foi possível verificar a disponibilidade de email"
        )
      };
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
  ): Promise<{ success: boolean; result?: any; error?: AppError }> {
    try {
      if (!recipientEmail) {
        throw new AppError(
          "Email do destinatário não fornecido",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      if (!event || !event.title) {
        throw new AppError(
          "Dados do evento inválidos ou incompletos",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      // Verifica se o serviço de email está disponível
      const availabilityCheck = await this.isAvailable();
      if (!availabilityCheck.success || !availabilityCheck.available) {
        throw new AppError(
          "Serviço de email não disponível no dispositivo",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      const dateFormatted = moment(event.date).format("DD/MM/YYYY");
      const timeFormatted = moment(event.date).format("HH:mm");

      // Adiciona um timeout para evitar operações bloqueantes
      const emailPromise = Promise.race([
        MailComposer.composeAsync({
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
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao enviar email")), 10000)
        )
      ]);

      const result = await emailPromise as {
        status: string;
        [key: string]: any;
      };
      
      logger.info(`Email de lembrete enviado para ${recipientEmail}`, { 
        eventId: event.id, 
        status: result.status 
      });

      return { success: result.status === "sent", result };
    } catch (error) {
      logger.error("Erro ao enviar email de lembrete", error, { 
        recipientEmail, 
        eventId: event?.id 
      });
      
      return {
        success: false,
        error: AppError.fromError(
          error,
          ERROR_CODES.EMAIL.SEND,
          "Não foi possível enviar o email de lembrete"
        )
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
  ): Promise<{ success: boolean; result?: any; error?: AppError }> {
    try {
      if (!recipientEmail) {
        throw new AppError(
          "Email do destinatário não fornecido",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      if (!events || events.length === 0) {
        throw new AppError(
          "Nenhum compromisso para sincronizar",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      // Verifica se o serviço de email está disponível
      const availabilityCheck = await this.isAvailable();
      if (!availabilityCheck.success || !availabilityCheck.available) {
        throw new AppError(
          "Serviço de email não disponível no dispositivo",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      // Valida e filtra os eventos antes de processar
      const validEvents = events.filter(event => {
        if (!event || !event.title) {
          logger.warn("Evento inválido encontrado e removido da sincronização", { event });
          return false;
        }
        return true;
      });

      if (validEvents.length === 0) {
        throw new AppError(
          "Todos os eventos fornecidos são inválidos",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      const eventsHTML = validEvents
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

      // Adiciona um timeout para evitar operações bloqueantes
      const emailPromise = Promise.race([
        MailComposer.composeAsync({
          recipients: [recipientEmail],
          subject: `Sincronização de Compromissos - JusAgenda`,
          body: `
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Seus Compromissos</h2>
          <p>Aqui está a lista de compromissos sincronizada do JusAgenda:</p>
          
          ${eventsHTML}
          
          <p style="margin-top: 30px; font-style: italic;">Este email foi enviado automaticamente pelo JusAgenda.</p>
          `,
          isHtml: true,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao enviar email de sincronização")), 15000)
        )
      ]);

      const result = await emailPromise as {
        status: string;
        [key: string]: any;
      };
      
      logger.info(`Email de sincronização enviado para ${recipientEmail}`, { 
        eventCount: validEvents.length, 
        status: result.status 
      });

      return { success: result.status === "sent", result };
    } catch (error) {
      logger.error("Erro ao sincronizar compromissos via email", error, { 
        recipientEmail, 
        eventCount: events?.length 
      });
      
      return {
        success: false,
        error: AppError.fromError(
          error,
          ERROR_CODES.EMAIL.SEND,
          "Não foi possível sincronizar os compromissos via email"
        )
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
  ): Promise<{ success: boolean; alertConfig?: any; message?: string; error?: AppError }> {
    try {
      if (!event || !event.id) {
        throw new AppError(
          "Compromisso inválido", 
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      if (!recipientEmail) {
        throw new AppError(
          "Email do destinatário não fornecido", 
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      if (minutesBefore <= 0) {
        throw new AppError(
          "O tempo de alerta deve ser um valor positivo", 
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      // Verifica se o serviço de email está disponível
      const availabilityCheck = await this.isAvailable();
      if (!availabilityCheck.success || !availabilityCheck.available) {
        throw new AppError(
          "Serviço de email não disponível no dispositivo",
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      // Verifica se a data do evento é válida e futura
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) {
        throw new AppError(
          "Data do compromisso inválida", 
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      const now = new Date();
      if (eventDate <= now) {
        throw new AppError(
          "Não é possível configurar alerta para um compromisso passado", 
          ERROR_CODES.EMAIL.VALIDATION,
          true
        );
      }

      // Armazena a configuração para processamento posterior
      // (em uma aplicação real, isso seria armazenado em um banco de dados)
      const alertConfig = {
        eventId: event.id,
        recipientEmail,
        minutesBefore,
        isActive: true,
        createdAt: new Date().toISOString(),
        scheduledFor: new Date(eventDate.getTime() - (minutesBefore * 60000)).toISOString(),
      };

      // Em uma aplicação real, você implementaria uma lógica
      // para agendar o envio do email no momento apropriado

      logger.info(`Alerta por email configurado para evento`, { 
        eventId: event.id, 
        minutesBefore,
        recipientEmail,
        scheduledFor: alertConfig.scheduledFor
      });

      return {
        success: true,
        alertConfig,
        message: `Alerta por email configurado para ${minutesBefore} minutos antes do compromisso`,
      };
    } catch (error) {
      logger.error("Erro ao configurar alerta por email", error, { 
        eventId: event?.id, 
        recipientEmail, 
        minutesBefore 
      });
      
      return {
        success: false,
        error: AppError.fromError(
          error,
          ERROR_CODES.EMAIL.SEND,
          "Não foi possível configurar o alerta por email"
        )
      };
    }
  }
}

export default EmailService;
