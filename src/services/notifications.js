import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { AppError, ERROR_CODES } from "../utils/AppError";
import { logger } from "../utils/loggerService";

// Configuração do handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registra o dispositivo para receber notificações push.
 * Necessário apenas para notificações remotas.
 *
 * @returns {Promise<string|null>} Token de push notifications ou null se falhar
 */
/**
 * Registra o dispositivo para receber notificações push.
 * Necessário apenas para notificações remotas.
 *
 * @returns {Promise<{success: boolean, token?: string, error?: AppError}>} Resultado da operação
 */
export const registerForPushNotificationsAsync = async () => {
  try {
    if (!Device.isDevice) {
      logger.warn("Notificações push requerem um dispositivo físico");
      return {
        success: false,
        error: new AppError(
          "Notificações push requerem um dispositivo físico",
          ERROR_CODES.NOTIFICATIONS.PERMISSION,
          true
        )
      };
    }

    // Verifica e solicita permissões
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      logger.warn("Permissão para notificações não concedida");
      return {
        success: false,
        error: new AppError(
          "Permissão para notificações não concedida",
          ERROR_CODES.NOTIFICATIONS.PERMISSION,
          true
        )
      };
    }

    // Adiciona um timeout para evitar operações bloqueantes
    const tokenPromise = Promise.race([
      Notifications.getExpoPushTokenAsync({
        projectId: "9fbfcc37-3525-4ca7-980b-addb8228620b",
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao obter token de push")), 5000)
      )
    ]);

    const token = await tokenPromise;

    // Configurações específicas para Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6200ee",
      });
    }

    logger.info("Dispositivo registrado para notificações push", { token: token.data });
    return { success: true, token: token.data };
  } catch (error) {
    logger.error("Erro ao registrar para notificações push", error);
    return {
      success: false,
      error: AppError.fromError(
        error,
        ERROR_CODES.NOTIFICATIONS.PERMISSION,
        "Erro ao registrar dispositivo para notificações"
      )
    };
  }
};

/**
 * Mock function to simulate sending an email notification.
 * Replace with real implementation if needed.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @returns {Promise<boolean>} True if sent successfully
 */
export const sendEmail = async (to, subject, body) => {
  console.log(`Mock sendEmail: To=${to}, Subject=${subject}, Body=${body}`);
  return true;
};

/**
 * Configura e solicita permissões para notificações.
 *
 * @returns {Promise<boolean>} True se as permissões forem concedidas, false caso contrário.
 */
/**
 * Configura e solicita permissões para notificações.
 *
 * @returns {Promise<{success: boolean, error?: AppError}>} Resultado da operação
 */
export const configureNotifications = async () => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      logger.warn("Permissões de notificação não concedidas");
      return {
        success: false,
        error: new AppError(
          "Permissões de notificação não concedidas",
          ERROR_CODES.NOTIFICATIONS.PERMISSION,
          true
        )
      };
    }

    // Configuração do canal para Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Padrão",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6200ee",
      });
    }

    logger.info("Notificações configuradas com sucesso");
    return { success: true };
  } catch (error) {
    logger.error("Erro ao configurar notificações", error);
    return {
      success: false,
      error: AppError.fromError(
        error,
        ERROR_CODES.NOTIFICATIONS.PERMISSION,
        "Erro ao configurar notificações"
      )
    };
  }
};

/**
 * Agenda uma notificação.
 *
 * @param {Object} options - Opções da notificação.
 * @param {string} options.title - Título da notificação.
 * @param {string} options.body - Corpo da notificação.
 * @param {number} options.time - Tempo em milissegundos para acionar a notificação.
 * @returns {Promise<string>} ID da notificação agendada
 */
/**
 * Agenda uma notificação.
 *
 * @param {Object} options - Opções da notificação
 * @param {string} options.title - Título da notificação
 * @param {string} options.body - Corpo da notificação
 * @param {number} options.time - Tempo em milissegundos para acionar a notificação
 * @returns {Promise<{success: boolean, notificationId?: string, error?: AppError}>} Resultado da operação
 */
export const scheduleNotification = async ({ title, body, time }) => {
  try {
    if (!title || !body) {
      return {
        success: false,
        error: new AppError(
          "Título e corpo da notificação são obrigatórios",
          ERROR_CODES.NOTIFICATIONS.VALIDATION,
          true
        )
      };
    }

    // Certifique-se de que temos permissão
    const permissionResult = await configureNotifications();
    if (!permissionResult.success) {
      return permissionResult;
    }

    // Adiciona um timeout para evitar operações bloqueantes
    const schedulePromise = Promise.race([
      Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: Math.max(1, Math.floor(time / 1000)),
          channelId: "default",
        },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao agendar notificação")), 5000)
      )
    ]);

    const notificationId = await schedulePromise;
    logger.info("Notificação agendada com sucesso", { notificationId, title });
    
    return {
      success: true,
      notificationId
    };
  } catch (error) {
    logger.error("Erro ao agendar notificação", error, { title, time });
    return {
      success: false,
      error: AppError.fromError(
        error,
        ERROR_CODES.NOTIFICATIONS.SCHEDULE,
        "Erro ao agendar notificação"
      )
    };
  }
};

/**
 * Cancela todas as notificações agendadas.
 *
 * @returns {Promise<void>}
 */
/**
 * Cancela todas as notificações agendadas.
 *
 * @returns {Promise<{success: boolean, error?: AppError}>} Resultado da operação
 */
export const cancelAllNotifications = async () => {
  try {
    // Adiciona um timeout para evitar operações bloqueantes
    const cancelPromise = Promise.race([
      Notifications.cancelAllScheduledNotificationsAsync(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao cancelar notificações")), 5000)
      )
    ]);

    await cancelPromise;
    logger.info("Todas as notificações foram canceladas");
    
    return { success: true };
  } catch (error) {
    logger.error("Erro ao cancelar todas as notificações", error);
    return {
      success: false,
      error: AppError.fromError(
        error,
        ERROR_CODES.NOTIFICATIONS.CANCEL,
        "Erro ao cancelar notificações"
      )
    };
  }
};

/**
 * Cancela uma notificação específica pelo ID.
 *
 * @param {string} notificationId - ID da notificação a ser cancelada
 * @returns {Promise<void>}
 */
/**
 * Cancela uma notificação específica pelo ID.
 *
 * @param {string} notificationId - ID da notificação a ser cancelada
 * @returns {Promise<{success: boolean, error?: AppError}>} Resultado da operação
 */
export const cancelNotification = async (notificationId) => {
  try {
    if (!notificationId) {
      logger.warn("ID de notificação não fornecido para cancelamento");
      return {
        success: false,
        error: new AppError(
          "ID de notificação não fornecido",
          ERROR_CODES.NOTIFICATIONS.VALIDATION,
          true
        )
      };
    }

    // Adiciona um timeout para evitar operações bloqueantes
    const cancelPromise = Promise.race([
      Notifications.cancelScheduledNotificationAsync(notificationId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao cancelar notificação")), 5000)
      )
    ]);

    await cancelPromise;
    logger.info("Notificação cancelada com sucesso", { notificationId });
    
    return { success: true };
  } catch (error) {
    logger.error(`Erro ao cancelar notificação`, error, { notificationId });
    return {
      success: false,
      error: AppError.fromError(
        error,
        ERROR_CODES.NOTIFICATIONS.CANCEL,
        "Erro ao cancelar notificação"
      )
    };
  }
};
