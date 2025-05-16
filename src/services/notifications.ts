import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

/**
 * Placeholder function for configuring notifications.
 * Actual implementation will require requesting permissions and setting up handlers.
 */
export const configureNotifications = async (): Promise<boolean> => {
  console.log("Placeholder: configureNotifications called. Implement actual notification logic here.");

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
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permissão Necessária', 'Não foi possível obter permissão para notificações push!');
    return false;
  }
  
  // console.log('Notification permissions granted.');
  return true;
};

// Example of how you might schedule a local notification (not used by SettingsScreen directly)
export const scheduleLocalNotification = async (title: string, body: string, data: Record<string, unknown>, trigger: Notifications.NotificationTriggerInput) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data, // optional data to pass with the notification
        sound: 'default', // plays the default sound
      },
      trigger, // e.g., { seconds: 60, repeats: true } or a date
    });
    console.log('Notification scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Example of how to cancel all scheduled notifications
export const cancelAllScheduledNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All scheduled notifications cancelled.');
    } catch (error) {
        console.error('Error cancelling scheduled notifications:', error);
    }
};

// It's also good practice to set a notification handler for when notifications are received while the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Added for iOS 14+
    shouldShowList: true,   // Added for iOS 14+
  }),
});
