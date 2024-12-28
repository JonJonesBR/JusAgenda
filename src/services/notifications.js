import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

/**
 * Configures the notifications system.
 * @returns {Promise<boolean>} True if permission is granted, false otherwise.
 */
export const configureNotifications = async () => {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return false;
  }

  return true;
};

/**
 * Schedules a notification.
 * @param {Object} options
 * @param {string} options.title - The title of the notification.
 * @param {string} options.body - The body content of the notification.
 * @param {number} options.time - Time in milliseconds to trigger the notification.
 */
export const scheduleNotification = async ({ title, body, time }) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: { seconds: time / 1000 },
    });
    console.log('Notification scheduled successfully!');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Cancels all scheduled notifications.
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications have been canceled.');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};
