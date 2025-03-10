import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configura o manipulador de notificações para o app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicita permissões para notificações e configura o canal (Android).
 *
 * @returns {Promise<boolean>} True se as permissões forem concedidas.
 * @throws {Error} Se as permissões não forem concedidas.
 */
export const requestPermissions = async () => {
  try {
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    if (notificationStatus !== 'granted') {
      throw new Error("Permissões de notificação não concedidas.");
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6200ee',
      });
    }
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissões:', error.message);
    throw new Error("Erro ao solicitar permissões de notificação.");
  }
};

/**
 * Gerencia notificações do aplicativo.
 */
class NotificationService {
  /**
   * Agenda uma notificação para um evento.
   * @param {Object} event - Evento para notificar.
   * @param {string} customMessage - Mensagem personalizada (opcional).
   * @returns {Promise<string|null>} ID da notificação agendada ou null se não agendado.
   */
  async scheduleNotification(event, customMessage) {
    const trigger = new Date(event.date);
    trigger.setDate(trigger.getDate() - 1); // Notifica 1 dia antes
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete de Compromisso',
        body: customMessage || `Você tem ${event.title} amanhã`,
      },
      trigger,
    });
  }

  async cancelNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async scheduleEventNotification(event) {
    try {
      if (!event?.date) {
        throw new Error('Data do evento é obrigatória para agendar notificação');
      }
      if (!event?.title) {
        throw new Error('Título do evento é obrigatório para agendar notificação');
      }
      const notificationDate = new Date(event.date);
      notificationDate.setDate(notificationDate.getDate() - 1);
      notificationDate.setHours(9, 0, 0); // 9h da manhã

      const now = new Date();
      if (notificationDate <= now) {
        console.warn('Data de notificação no passado, notificação não será agendada');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete de Compromisso',
          body: `Amanhã: ${event.title}`,
          data: { eventId: event.id },
        },
        trigger: notificationDate,
      });

      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId) {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  }

  static async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permissão para notificações não concedida');
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6200ee',
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  }
}

export default NotificationService;
