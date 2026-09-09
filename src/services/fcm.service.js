import { messaging } from '../config/firebase.js';
import logger from '../utils/logger.js';

/**
 * Sends a high-priority emergency push notification to target FCM tokens.
 * @param {object} params - Parameters object
 * @param {Array<string>} params.fcmTokens - List of recipient FCM tokens
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {object} [params.data] - Additional key-value payload data
 */
export const sendEmergencyPushNotification = async ({ fcmTokens, title, body, data = {} }) => {
  if (!messaging) {
    logger.warn('Firebase Messaging not initialized. Mocking push notification:', { title, body, data });
    return { successCount: fcmTokens.length, failureCount: 0 };
  }

  if (!fcmTokens || fcmTokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const messagePayload = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      sound: 'emergency_alarm.mp3',
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'emergency_alarm',
        channelId: 'emergency_sos_channel',
        priority: 'max',
      },
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          sound: 'emergency_alarm.caf',
          badge: 1,
        },
      },
    },
    tokens: fcmTokens,
  };

  try {
    const response = await messaging.sendEachForMulticast(messagePayload);
    logger.info(`FCM multicast sent. Success: ${response.successCount}, Failures: ${response.failureCount}`);

    if (response.failureCount > 0 && response.responses) {
      response.responses.forEach((res, idx) => {
        if (!res.success && res.error) {
          const errorCode = res.error.code;
          const failedToken = fcmTokens[idx];
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/invalid-argument'
          ) {
            logger.warn(`Pruning stale FCM token from DB: ${failedToken} (Error: ${errorCode})`);
            import('../models/user.model.js').then(({ clearStaleFcmToken }) => {
              clearStaleFcmToken(failedToken).catch((err) =>
                logger.error('Error clearing stale FCM token:', err)
              );
            });
          }
        }
      });
    }

    return response;
  } catch (err) {
    logger.error('Failed to send FCM multicast message:', err);
    throw err;
  }
};

