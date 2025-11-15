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
 * Save notification to Firestore for specific user
 */
export async function saveNotificationToFirestore(userId, notificationData) {
  try {
    const { collection, addDoc } = require('firebase/firestore');
    
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type,
      eventId: notificationData.eventId || null,
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    console.log(`✅ Bildirim Firestore'a kaydedildi (User: ${userId})`);
  } catch (error) {
    console.error('❌ Firestore bildirim kaydetme hatası:', error);
  }
}

/**
 * Send admin approval notification to specific user
 */
export async function sendAdminApprovalNotification(userId, isApproved, language = 'tr') {
  try {
    if (!userId) {
      console.error('❌ UserId gerekli!');
      return;
    }

    const notificationData = {
      title: isApproved 
        ? (language === 'tr' ? '✅ Hesap Onaylandı!' : '✅ Account Approved!')
        : (language === 'tr' ? '❌ Hesap Reddedildi' : '❌ Account Rejected'),
      body: isApproved 
        ? (language === 'tr' 
          ? 'Hesabınız onaylandı! Artık etkinliklere katılabilirsiniz.'
          : 'Your account has been approved! You can now join events.')
        : (language === 'tr'
          ? 'Hesabınız onaylanmadı. Daha fazla bilgi için destek ile iletişime geçin.'
          : 'Your account was not approved. Please contact support for more information.'),
      type: 'admin_approval',
      isApproved: isApproved,
    };

    // Firestore'a kaydet (onaylanan kullanıcı için)
    await saveNotificationToFirestore(userId, notificationData);
    
    console.log(`✅ Onay bildirimi gönderildi (User: ${userId}, Approved: ${isApproved})`);
  } catch (error) {
    console.error('❌ Onay bildirimi gönderme hatası:', error);
  }
}

/**
 * Send event cancellation notification to all participants
 */
export async function sendEventCancellationNotification(eventId, eventName, participants = [], language = 'tr') {
  try {
    if (!eventId || !participants || participants.length === 0) {
      console.log('⚠️ Etkinlik iptal bildirimi: Katılımcı yok');
      return;
    }

    const notificationData = {
      title: language === 'tr' ? '❌ Etkinlik İptal Edildi' : '❌ Event Cancelled',
      body: language === 'tr' 
        ? `"${eventName}" etkinliği iptal edildi.`
        : `"${eventName}" event has been cancelled.`,
      type: 'event_cancelled',
      eventId: eventId,
    };

    // Tüm katılımcılara bildirim gönder
    for (const participantId of participants) {
      await saveNotificationToFirestore(participantId, notificationData);
    }
    
    console.log(`✅ İptal bildirimi gönderildi (${participants.length} katılımcı)`);
  } catch (error) {
    console.error('❌ İptal bildirimi gönderme hatası:', error);
  }
}

/**
 * Send event update notification to all participants
 */
export async function sendEventUpdateNotification(eventId, eventName, participants = [], updateType = 'updated', language = 'tr') {
  try {
    if (!eventId || !participants || participants.length === 0) {
      console.log('⚠️ Etkinlik güncelleme bildirimi: Katılımcı yok');
      return;
    }

    const messages = {
      tr: {
        updated: 'güncellendi',
        date_changed: 'tarihi değişti',
        location_changed: 'konumu değişti',
      },
      en: {
        updated: 'has been updated',
        date_changed: 'date has changed',
        location_changed: 'location has changed',
      },
    };

    const notificationData = {
      title: language === 'tr' ? '📝 Etkinlik Güncellendi' : '📝 Event Updated',
      body: language === 'tr'
        ? `"${eventName}" etkinliği ${messages.tr[updateType] || messages.tr.updated}.`
        : `"${eventName}" event ${messages.en[updateType] || messages.en.updated}.`,
      type: 'event_updated',
      eventId: eventId,
      updateType: updateType,
    };

    // Tüm katılımcılara bildirim gönder
    for (const participantId of participants) {
      await saveNotificationToFirestore(participantId, notificationData);
    }
    
    console.log(`✅ Güncelleme bildirimi gönderildi (${participants.length} katılımcı)`);
  } catch (error) {
    console.error('❌ Güncelleme bildirimi gönderme hatası:', error);
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

