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
 * Agenda uma notificação para um evento.
 *
 * @param {Object} event - Objeto do evento.
 * @param {string} customMessage - Mensagem customizada para a notificação.
 * @returns {Promise<string|null>} ID da notificação se agendada, ou null em caso de erro.
 */
export const scheduleEventNotification = async (event, customMessage) => {
  const notificationDate = new Date(event.date);
  // Agenda a notificação 24 horas antes do evento.
  notificationDate.setDate(notificationDate.getDate() - 1);

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete de Evento',
        body: customMessage || `Você tem um evento "${event.title}" amanhã`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { eventId: event.id },
      },
      trigger: { date: notificationDate },
    });

    return notificationId;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return null;
  }
};

/**
 * Cancela uma notificação agendada.
 *
 * @param {string} notificationId - ID da notificação.
 * @returns {Promise<boolean>} True se cancelada, false caso contrário.
 */
export const cancelEventNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
    return false;
  }
};
