import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';

// Notification handler configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get token
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push notification token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Save push token to user document in Firebase
 */
export async function savePushTokenToUser(userId, token) {
  if (!token || !userId) return;
  
  try {
    await updateDoc(doc(db, 'users', userId), {
      pushToken: token,
      pushTokenUpdatedAt: new Date().toISOString(),
    });
    console.log('Push token saved to Firebase');
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

/**
 * Schedule event reminder notifications
 */
export async function scheduleEventReminders(eventId, eventName, eventDate) {
  try {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    
    // Cancel existing notifications for this event
    await cancelEventNotifications(eventId);
    
    // 1 day before reminder
    const oneDayBefore = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (oneDayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Etkinlik Yaklaşıyor!',
          body: `"${eventName}" etkinliğine 1 gün kaldı!`,
          data: { eventId, type: 'reminder', time: '1day' },
          sound: true,
        },
        trigger: {
          date: oneDayBefore,
        },
        identifier: `event_${eventId}_1day`,
      });
      console.log('1 day reminder scheduled');
    }
    
    // 1 hour before reminder
    const oneHourBefore = new Date(eventDateTime.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Etkinlik Yakında Başlıyor!',
          body: `"${eventName}" 1 saat içinde başlayacak!`,
          data: { eventId, type: 'reminder', time: '1hour' },
          sound: true,
        },
        trigger: {
          date: oneHourBefore,
        },
        identifier: `event_${eventId}_1hour`,
      });
      console.log('1 hour reminder scheduled');
    }
    
    console.log('Event reminders scheduled successfully');
  } catch (error) {
    console.error('Error scheduling reminders:', error);
  }
}

/**
 * Cancel all notifications for a specific event
 */
export async function cancelEventNotifications(eventId) {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    const eventNotifications = allNotifications.filter(
      notification => 
        notification.identifier === `event_${eventId}_1day` ||
        notification.identifier === `event_${eventId}_1hour`
    );
    
    for (const notification of eventNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    
    console.log('Event notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Send local notification for new participant
 */
export async function sendNewParticipantNotification(eventName, participantName) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👥 Yeni Katılımcı!',
        body: `${participantName}, "${eventName}" etkinliğine katıldı!`,
        data: { type: 'new_participant' },
        sound: true,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error sending participant notification:', error);
  }
}

/**
 * Send admin approval notification
 */
export async function sendAdminApprovalNotification(isApproved) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isApproved ? '✅ Hesap Onaylandı!' : '❌ Hesap Reddedildi',
        body: isApproved 
          ? 'Hesabınız onaylandı! Artık etkinliklere katılabilirsiniz.'
          : 'Hesabınız onaylanmadı. Daha fazla bilgi için destek ile iletişime geçin.',
        data: { type: 'admin_approval', isApproved },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending approval notification:', error);
  }
}

/**
 * Send event cancellation notification
 */
export async function sendEventCancellationNotification(eventName) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '❌ Etkinlik İptal Edildi',
        body: `"${eventName}" etkinliği iptal edildi.`,
        data: { type: 'event_cancelled' },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
  }
}

/**
 * Send event update notification
 */
export async function sendEventUpdateNotification(eventName, updateType = 'updated') {
  try {
    const messages = {
      updated: 'güncellendi',
      date_changed: 'tarihi değişti',
      location_changed: 'konumu değişti',
    };
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Etkinlik Güncellendi',
        body: `"${eventName}" etkinliği ${messages[updateType] || messages.updated}.`,
        data: { type: 'event_updated', updateType },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending update notification:', error);
  }
}

/**
 * Send chat message notification
 */
export async function sendChatMessageNotification(eventName, senderName, message) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💬 ${eventName}`,
        body: `${senderName}: ${message}`,
        data: { type: 'chat_message' },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending chat notification:', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('All notifications cleared');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

