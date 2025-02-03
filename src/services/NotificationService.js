import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configura as notificações para o app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicita permissões para notificações
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

// Agenda uma notificação para um evento
export const scheduleEventNotification = async (event, customMessage) => {
  const notificationDate = new Date(event.date);
  notificationDate.setDate(notificationDate.getDate() - 1); // 24 horas antes

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete de Evento',
        body: customMessage || `Você tem um evento "${event.title}" amanhã`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { eventId: event.id },
      },
      trigger: {
        date: notificationDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return null;
  }
};

// Remove uma notificação agendada
export const cancelEventNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
    return false;
  }
};
