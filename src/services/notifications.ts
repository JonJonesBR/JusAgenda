// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { Event as EventType } from '../types/event'; // Usando o tipo EventType
import { Toast } from '../components/ui/Toast'; // Supondo que Toast.show exista e funcione estaticamente

// Configura o manipulador de notificações para quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Mostrar alerta
    shouldPlaySound: true, // Reproduzir som
    shouldSetBadge: true, // Atualizar o contador no ícone do app
  }),
});

/**
 * Registra o dispositivo para receber notificações push (locais ou remotas).
 * Pede permissão ao usuário se ainda não concedida.
 * @returns Promise<string | undefined> O token ExpoPushToken se a permissão for concedida para push remoto,
 * ou uma string indicando status para notificações locais, ou undefined se a permissão for negada/falhar.
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250], // Padrão de vibração
      lightColor: '#FF231F7C', // Cor da luz de notificação
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido ao solicitar permissões';
      console.error('Erro ao solicitar permissões de notificação:', message);
      Toast.show({ type: 'error', text1: 'Erro de Permissão', text2: 'Não foi possível solicitar permissões para notificações.' });
      return undefined;
    }
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permissão Necessária',
      'Por favor, habilite as notificações nas configurações do seu dispositivo para receber lembretes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
      ]
    );
    return undefined;
  }

  // Para notificações locais, o token não é estritamente necessário para agendar,
  // mas obtê-lo pode ser útil para consistência ou futuras notificações push.
  // Se for usar APENAS notificações locais, esta parte do token pode ser opcional.
  try {
    // Nota: getExpoPushTokenAsync() pode lançar erro se o app não estiver configurado para push remote.
    // Para notificações locais, o mais importante é a permissão 'granted'.
    // token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas.projectId })).data;
    // console.log('Expo Push Token:', token);
    // Por enquanto, vamos retornar um status para notificações locais.
    return 'permission_granted_for_local_notifications';
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.warn(`Falha ao obter o Expo Push Token: ${message}. Notificações locais ainda devem funcionar se a permissão foi concedida.`);
    // Se o token for crucial, trate o erro de forma mais específica.
    // Para locais, a permissão já verificada é o mais importante.
    if (finalStatus === 'granted') {
      return 'permission_granted_for_local_notifications_no_token';
    }
    return undefined;
  }
}


/**
 * Agenda uma notificação local.
 * @param title - Título da notificação.
 * @param body - Corpo da notificação.
 * @param data - Dados adicionais para anexar à notificação.
 * @param trigger - Gatilho para a notificação (ex: data, intervalo).
 * @returns Promise<string | null> O ID da notificação agendada ou null se falhar.
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: Record<string, unknown> = {}, // Permite anexar dados extras
  trigger: Notifications.NotificationTriggerInput // Usando o tipo correto
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data, // Dados que você pode usar ao receber a notificação
        sound: 'default', // Som padrão
        // badge: 1, // Define o contador do ícone (opcional)
        // color: '#FF0000', // Cor de acento (Android)
      },
      trigger,
    });
    console.log(`Notificação agendada com ID: ${notificationId}, Título: ${title}, Gatilho:`, trigger);
    Toast.show({ type: 'success', text1: 'Lembrete Agendado', text2: title });
    return notificationId;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao agendar notificação local:', message);
    Toast.show({ type: 'error', text1: 'Erro ao Agendar', text2: 'Não foi possível agendar o lembrete.' });
    return null;
  }
}

/**
 * Cria um gatilho de notificação para uma data e hora específicas.
 * @param date - O objeto Date para o qual o gatilho deve ser definido.
 * @returns Notifications.DateTriggerInput ou null se a data for inválida ou no passado.
 */
export function createDateTrigger(date: Date): Notifications.DateTriggerInput | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('createDateTrigger: Data fornecida é inválida.');
    return null;
  }
  if (date.getTime() <= Date.now()) {
    // console.warn('createDateTrigger: A data do gatilho está no passado.');
    // Algumas plataformas podem não agendar ou disparar imediatamente.
    // Decida se quer permitir isso ou retornar null. Por ora, permite.
    // return null; // Descomente se não quiser agendar para o passado.
  }
  return {
    date: date, // Passa o objeto Date diretamente
    // channelId: 'default', // Opcional, se você tiver canais específicos
  };
}

// createTimeIntervalTrigger removed
// scheduleTestNotificationHandler removed

/**
 * Cancela uma notificação agendada específica.
 * @param notificationId - O ID da notificação a ser cancelada.
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notificação cancelada: ${notificationId}`);
    Toast.show({ type: 'info', text1: 'Lembrete Cancelado', text2: `ID: ${notificationId}` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao cancelar notificação ${notificationId}:`, message);
    Toast.show({ type: 'error', text1: 'Erro ao Cancelar', text2: 'Não foi possível cancelar o lembrete.' });
  }
}

/**
 * Cancela todas as notificações agendadas.
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações agendadas foram canceladas.');
    Toast.show({ type: 'info', text1: 'Lembretes Cancelados', text2: 'Todos os lembretes foram removidos.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao cancelar todas as notificações:', message);
    Toast.show({ type: 'error', text1: 'Erro ao Cancelar', text2: 'Não foi possível remover todos os lembretes.' });
  }
}

/**
 * Configura listeners para interações com notificações.
 * (ex: quando o usuário toca em uma notificação)
 */
export function setupNotificationListeners(): void {
  // Listener para quando o usuário toca em uma notificação (app em background ou fechado)
  const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notificação recebida em background/fechado:', response);
    const notificationData = response.notification.request.content.data;
    // Ex: Navegar para uma tela específica baseada nos dados da notificação
    if (notificationData && typeof notificationData === 'object' && 'eventId' in notificationData) {
      console.log('Navegar para o evento ID:', notificationData.eventId);
      // navigation.navigate('EventDetails', { eventId: notificationData.eventId });
    }
  });

  // Listener para quando uma notificação é recebida enquanto o app está em primeiro plano
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificação recebida em primeiro plano:', notification);
    // Você pode querer exibir um toast customizado aqui em vez do alerta padrão do sistema,
    // dependendo da configuração em setNotificationHandler.
    Toast.show({
        type: 'info',
        text1: notification.request.content.title || 'Lembrete',
        text2: notification.request.content.body || '',
    });
  });

  // Não se esqueça de remover os listeners quando o componente/app for desmontado
  // return () => {
  //   Notifications.removeNotificationSubscription(backgroundSubscription);
  //   Notifications.removeNotificationSubscription(foregroundSubscription);
  // };
  // Em um app funcional, você chamaria esta função uma vez (ex: no App.tsx)
  // e retornaria a função de cleanup para ser chamada no useEffect de lá.
}

// setupNotificationListeners removed

/**
 * Agenda lembretes para um evento específico.
 * @param event - O objeto EventType para o qual agendar lembretes.
 */
export async function scheduleRemindersForEvent(event: EventType): Promise<void> {
  if (!event.reminders || event.reminders.length === 0) {
    return; // Sem lembretes para agendar
  }

  if (!event.data) {
    console.warn(`Não é possível agendar lembretes para o evento "${event.title}" sem data.`);
    return;
  }

  // Combina data e hora do evento
  let eventDateTimeString = event.data;
  if (event.hora) { // Formato HH:MM
    eventDateTimeString += `T${event.hora}:00`; // Assume segundos como 00
  } else {
    eventDateTimeString += `T00:00:00`; // Assume meia-noite se não houver hora
  }

  const eventDate = new Date(eventDateTimeString); // Tenta parsear a string combinada
  // É crucial que event.data e event.hora resultem em uma string que new Date() entenda corretamente,
  // ou use date-fns.parse para maior controle.
  // Ex: const eventDate = parse(`${event.data} ${event.hora || '00:00'}`, 'yyyy-MM-dd HH:mm', new Date());

  if (isNaN(eventDate.getTime())) {
    console.warn(`Data/hora inválida para o evento "${event.title}", não é possível agendar lembretes. (Input: ${eventDateTimeString})`);
    return;
  }

  for (const minutesBefore of event.reminders) {
    const reminderDate = new Date(eventDate.getTime() - minutesBefore * 60000);

    if (reminderDate.getTime() <= Date.now()) {
      // console.log(`Lembrete para "${event.title}" (${minutesBefore} min antes) está no passado. Não será agendado.`);
      continue; // Não agenda lembretes no passado
    }

    const trigger = createDateTrigger(reminderDate);
    if (trigger) {
      const title = `Lembrete: ${event.title}`;
      const body = `Seu evento "${event.title}" começa em ${minutesBefore} minuto(s). Local: ${event.local || 'Não especificado'}.`;
      await scheduleLocalNotification(title, body, { eventId: event.id, type: 'eventReminder' }, trigger);
    }
  }
}
