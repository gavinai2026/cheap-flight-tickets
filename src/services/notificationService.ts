import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('price-alerts', {
      name: 'Price Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A73E8',
    });

    await Notifications.setNotificationChannelAsync('flight-updates', {
      name: 'Flight Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
  return token;
};

export const schedulePriceAlert = async (
  route: string,
  targetPrice: number,
  currentPrice: number
): Promise<string> => {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Price Drop Alert! ✈️',
      body: `${route} dropped to $${currentPrice}! Your target was $${targetPrice}.`,
      data: { type: 'price_alert', route },
      sound: true,
    },
    trigger: null, // immediate
  });
  return id;
};

export const scheduleFlightReminder = async (
  flightNumber: string,
  departureTime: string,
  hoursBeforeVal: number = 24
): Promise<string> => {
  const depDate = new Date(departureTime);
  const triggerDate = new Date(depDate.getTime() - hoursBeforeVal * 60 * 60 * 1000);

  if (triggerDate <= new Date()) {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: `Flight ${flightNumber} Reminder`,
        body: `Your flight departs soon! Check-in and prepare for departure.`,
        data: { type: 'flight_reminder', flightNumber },
      },
      trigger: null,
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Flight ${flightNumber} Tomorrow`,
      body: `Your flight departs in ${hoursBeforeVal} hours. Time to prepare!`,
      data: { type: 'flight_reminder', flightNumber },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
};

export const cancelNotification = async (id: string) => {
  await Notifications.cancelScheduledNotificationAsync(id);
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getBadgeCount = async (): Promise<number> => {
  return Notifications.getBadgeCountAsync();
};

export const setBadgeCount = async (count: number) => {
  await Notifications.setBadgeCountAsync(count);
};

export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
