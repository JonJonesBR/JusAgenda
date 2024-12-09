import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

/**
 * Configuração inicial para as notificações.
 * @returns {Promise<boolean>} True se a permissão for concedida, false caso contrário.
 */
export const configureNotifications = async () => {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissão para notificações não foi concedida');
    return false;
  }

  return true;
};

/**
 * Agendar uma notificação.
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.body
 * @param {number} options.time
 */
export const scheduleNotification = async ({ title, body, time }) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: time,
    });
    console.log('Notificação agendada com sucesso!');
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
  }
};

/**
 * Cancelar todas as notificações.
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações foram canceladas.');
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
};
