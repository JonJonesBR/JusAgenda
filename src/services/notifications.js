import * as Notifications from 'expo-notifications';

/**
 * Configura e solicita permissões para notificações.
 *
 * @returns {Promise<boolean>} True se as permissões forem concedidas, false caso contrário.
 */
export const configureNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissões de notificação não concedidas');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao configurar notificações:', error);
    return false;
  }
};

/**
 * Agenda uma notificação.
 *
 * @param {Object} options - Opções da notificação.
 * @param {string} options.title - Título da notificação.
 * @param {string} options.body - Corpo da notificação.
 * @param {number} options.time - Tempo em milissegundos para acionar a notificação.
 * @returns {Promise<void>}
 */
export const scheduleNotification = async ({ title, body, time }) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: { seconds: time / 1000 },
    });
    console.log('Notificação agendada com sucesso!');
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    throw error;
  }
};

/**
 * Cancela todas as notificações agendadas.
 *
 * @returns {Promise<void>}
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações foram canceladas.');
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
    throw error;
  }
};
