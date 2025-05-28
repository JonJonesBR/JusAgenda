import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';

// Configura o manipulador de notificações para quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: Platform.OS === 'ios' ? true : undefined,
    shouldShowList: Platform.OS === 'ios' ? true : undefined,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // ... (código existente da função registerForPushNotificationsAsync)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
        ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowCriticalAlerts: false,
        }
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permissão de Notificação Necessária',
      'Para receber lembretes e atualizações, por favor, habilite as notificações nas configurações do seu dispositivo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
      ]
    );
    return null;
  }
  return 'permission_granted_for_local_notifications';
}

interface ScheduleNotificationParams {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  trigger: Notifications.NotificationTriggerInput;
}
export async function scheduleLocalNotification({ title, body, data, trigger }: ScheduleNotificationParams): Promise<string | undefined> {
  // ... (código existente da função scheduleLocalNotification)
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: 'default',
      },
      trigger: trigger,
    });
    console.log('Notificação agendada com ID:', identifier);
    Toast.show({
        type: 'success',
        text1: 'Lembrete Agendado!',
        text2: title,
    });
    return identifier;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    Toast.show({
        type: 'error',
        text1: 'Erro ao Agendar Lembrete',
        text2: 'Não foi possível agendar o lembrete.',
    });
    return undefined;
  }
}

// Função para calcular um gatilho de intervalo de tempo
// MODIFICADO: Usando 'any' como contorno para o tipo de retorno se o TS não resolver corretamente.
// Idealmente, seria Notifications.TimeIntervalNotificationTriggerInput
const calculateExampleTrigger = (secondsFromNow: number): any => { // Ou Notifications.NotificationTriggerInput
  // Acessando o enum NotificationTriggerType corretamente através do namespace Notifications
  // Se Notifications.NotificationTriggerType.TimeInterval ainda der erro, usar a string literal como último recurso.
  const triggerType = (Notifications as any).NotificationTriggerType?.TimeInterval || 'timeInterval';

  if (secondsFromNow <= 0) {
    return { type: triggerType, seconds: 1, repeats: false };
  }
  return { type: triggerType, seconds: secondsFromNow, repeats: false };
};

export async function scheduleTestNotificationHandler() {
  // ... (código existente da função scheduleTestNotificationHandler)
  const permission = await registerForPushNotificationsAsync();
  if (!permission) {
    return;
  }

  const title = "Lembrete de Teste JusAgenda";
  const body = "Este é um lembrete de teste agendado!";
  const data = { testData: "algum_dado_util_aqui" };
  const trigger = calculateExampleTrigger(10);

  await scheduleLocalNotification({title, body, data, trigger});
}

// ... (restante das funções cancelScheduledNotification, cancelAllScheduledNotifications, setupNotificationListeners)
export async function cancelScheduledNotification(identifier: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('Notificação cancelada:', identifier);
    Toast.show({
        type: 'info',
        text1: 'Lembrete Cancelado',
    });
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
     Toast.show({
        type: 'error',
        text1: 'Erro ao Cancelar',
        text2: 'Não foi possível cancelar o lembrete.',
    });
  }
}

export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações agendadas foram canceladas.');
    Toast.show({
        type: 'info',
        text1: 'Lembretes Cancelados',
        text2: 'Todos os lembretes foram removidos.',
    });
  } catch (error) {
    console.error('Erro ao cancelar todas as notificações:', error);
    Toast.show({
        type: 'error',
        text1: 'Erro ao Cancelar',
        text2: 'Não foi possível remover todos os lembretes.',
    });
  }
}

export const setupNotificationListeners = () => {
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notificação tocada - Resposta recebida:', response);
        const notificationData = response.notification.request.content.data as Record<string, unknown> | undefined;
        if (notificationData && typeof notificationData.eventId === 'string') {
            console.log('Navegar para o evento ID:', notificationData.eventId);
        }
    });

    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notificação recebida em primeiro plano:', notification);
    });

    return () => {
        Notifications.removeNotificationSubscription(responseListener);
        Notifications.removeNotificationSubscription(receivedListener);
    };
};
