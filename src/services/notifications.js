import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
export const registerForPushNotificationsAsync = async () => {
  try {
    if (!Device.isDevice) {
      console.warn('Notificações push requerem um dispositivo físico');
      return null;
    }

    // Verifica e solicita permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return null;
    }
    
    // Obtém o token de push (apenas necessário para notificações remotas)
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "9fbfcc37-3525-4ca7-980b-addb8228620b",
    });
    
    // Configurações específicas para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6200ee',
      });
    }
    
    return token.data;
  } catch (error) {
    console.error('Erro ao registrar para notificações push:', error);
    return null;
  }
};

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
    
    // Configuração do canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Padrão',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6200ee',
      });
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
 * @returns {Promise<string>} ID da notificação agendada
 */
export const scheduleNotification = async ({ title, body, time }) => {
  try {
    // Certifique-se de que temos permissão
    await configureNotifications();
    
    // Agendar a notificação
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { 
        seconds: Math.max(1, Math.floor(time / 1000)),
        channelId: 'default',
      },
    });
    
    console.log('Notificação agendada com sucesso:', notificationId);
    return notificationId;
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

/**
 * Cancela uma notificação específica pelo ID.
 * 
 * @param {string} notificationId - ID da notificação a ser cancelada
 * @returns {Promise<void>}
 */
export const cancelNotification = async (notificationId) => {
  try {
    if (!notificationId) {
      console.warn('ID de notificação não fornecido para cancelamento');
      return;
    }
    
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notificação ${notificationId} foi cancelada.`);
  } catch (error) {
    console.error(`Erro ao cancelar notificação ${notificationId}:`, error);
    throw error;
  }
};
