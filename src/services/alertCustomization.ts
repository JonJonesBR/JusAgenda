import { Event } from '../types/event';
import * as Notifications from 'expo-notifications';
import * as MailComposer from 'expo-mail-composer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AlertSettings {
  minutesBefore: number;
  repeat: boolean;
  repeatInterval?: 'minute' | 'hour' | 'day' | 'week';
  notificationType: 'push' | 'email' | 'both';
}

export async function scheduleCustomAlert(event: Event, settings: AlertSettings, email?: string) {
  // Push notification
  if (settings.notificationType === 'push' || settings.notificationType === 'both') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Lembrete: ${event.title}`,
        body: `Compromisso às ${event.data.toLocaleString()}`,
      },
      trigger: {
        seconds: settings.minutesBefore * 60,
        repeats: settings.repeat,
      },
    });
  }
  // Email notification
  if ((settings.notificationType === 'email' || settings.notificationType === 'both') && email) {
    await MailComposer.composeAsync({
      recipients: [email],
      subject: `Lembrete de compromisso: ${event.title}`,
      body: `Seu compromisso está agendado para ${event.data.toLocaleString()}`,
    });
  }
  // Persist settings for this event
  await AsyncStorage.setItem(`alertSettings_${event.id}`, JSON.stringify(settings));
}

export async function getAlertSettings(eventId: string): Promise<AlertSettings | null> {
  const data = await AsyncStorage.getItem(`alertSettings_${eventId}`);
  return data ? JSON.parse(data) : null;
}
