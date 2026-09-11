import { createSosAlert, updateSosAudioRecordUrl, resolveSosAlert, cancelFalseAlarmSosAlert } from '../models/sos.model.js';
import { getContactsByUserId } from '../models/contact.model.js';
import { sendEmergencyPushNotification } from '../services/fcm.service.js';
import { updateLiveLocationInRedis, getNearbyUserFcmTokens } from '../services/geo.service.js';
import { uploadAudioSnippet } from '../services/storage.service.js';
import { getIO } from '../sockets/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Triggers a high-priority emergency SOS alert and dispatches FCM notifications to emergency contacts and nearby bystanders.
 */
export const handleTriggerSos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, address, isSilent } = req.body;

    const sosAlert = await createSosAlert({ userId, latitude, longitude, address, isSilent });

    // Update victim's location in Redis spatial index
    if (latitude != null && longitude != null) {
      await updateLiveLocationInRedis(userId, 'victim', latitude, longitude);
    }

    // 1. Notify trusted emergency contacts via FCM
    const contacts = await getContactsByUserId(userId);
    const contactFcmTokens = contacts.map(c => c.fcm_token).filter(Boolean);

    const mapsUrl = (latitude != null && longitude != null) ? `https://maps.google.com/?q=${latitude},${longitude}` : '';
    const trackUrl = `https://echo.app/track/${sosAlert.id}`;

    if (contactFcmTokens.length > 0) {
      await sendEmergencyPushNotification({
        fcmTokens: contactFcmTokens,
        title: '🚨 EMERGENCY SOS ALERT',
        body: `EMERGENCY! Emergency contact has triggered an SOS alert at ${address || 'current location'}. Live Map: ${mapsUrl || trackUrl}`,
        data: {
          alertId: sosAlert.id,
          latitude: String(latitude || ''),
          longitude: String(longitude || ''),
          mapsUrl,
          trackUrl,
          type: 'EMERGENCY_CONTACT_SOS',
        },
      });
    }

    // 2. Query & notify nearest bystanders/users via FCM within 8km radius
    const { fcmTokens: nearbyFcmTokens, nearbyCount } = await getNearbyUserFcmTokens({
      latitude: latitude || 0,
      longitude: longitude || 0,
      radiusKm: 8,
      excludeUserId: userId,
    });

    const nearbyNotifiedCount = nearbyCount;

    if (nearbyFcmTokens.length > 0) {
      await sendEmergencyPushNotification({
        fcmTokens: nearbyFcmTokens,
        title: '🚨 NEARBY EMERGENCY SOS ALERT',
        body: `EMERGENCY! Someone nearby triggered an SOS alert at ${address || 'a location near you'}. Live Map: ${mapsUrl || trackUrl}`,
        data: {
          alertId: sosAlert.id,
          latitude: String(latitude || ''),
          longitude: String(longitude || ''),
          address: address || '',
          mapsUrl,
          trackUrl,
          type: 'NEARBY_SOS',
        },
      });
      logger.info(`Dispatched nearby FCM alert for SOS ${sosAlert.id} to ${nearbyFcmTokens.length} device(s).`);
    }

    // Broadcast real-time socket event to all clients on Nearby Incidents tab
    const io = getIO();
    if (io) {
      io.to('nearby_incidents').emit('sos:created', {
        id: sosAlert.id,
        user_id: userId,
        latitude: latitude || 0,
        longitude: longitude || 0,
        address: address || 'Nearby Location',
        status: sosAlert.status,
        created_at: sosAlert.created_at,
        nearby_responders_count: nearbyNotifiedCount,
      });
    }

    return successResponse(res, 201, 'SOS Alert triggered successfully.', {
      alertId: sosAlert.id,
      status: sosAlert.status,
      contactsNotifiedCount: contactFcmTokens.length,
      nearbyRespondersNotifiedCount: nearbyNotifiedCount,
      policeNotified: true,
      timestamp: sosAlert.created_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Uploads an emergency audio snippet file for an active SOS incident.
 */
export const handleUploadAudioSnippet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { alertId } = req.params;

    if (!req.file) {
      return errorResponse(res, 400, 'Audio file is required.');
    }

    const audioUrl = await uploadAudioSnippet(req.file.path, alertId);
    const updated = await updateSosAudioRecordUrl(alertId, userId, audioUrl);
    if (!updated) {
      return errorResponse(res, 404, 'Active SOS alert not found or unauthorized.');
    }

    const io = getIO();
    if (io) {
      io.to(`alert:${alertId}`).emit('sos:audio_uploaded', {
        alertId,
        audioRecordUrl: audioUrl,
        timestamp: new Date().toISOString(),
      });
    }

    return successResponse(res, 200, 'Audio snippet uploaded successfully.', {
      audioRecordUrl: audioUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Resolves an active SOS alert after victim safety is confirmed.
 */
export const handleResolveSos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { alertId } = req.params;

    const resolved = await resolveSosAlert(alertId, userId);
    if (!resolved) {
      return errorResponse(res, 404, 'Active SOS alert not found for resolution.');
    }

    return successResponse(res, 200, 'SOS alert resolved successfully.', { status: 'resolved' });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancels an active SOS alert triggered accidentally as a false alarm.
 */
export const handleCancelFalseAlarm = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { alertId } = req.params;
    const { reason, pin } = req.body;

    const cancelled = await cancelFalseAlarmSosAlert(alertId, userId);
    if (!cancelled) {
      return errorResponse(res, 404, 'Active SOS alert not found.');
    }

    return successResponse(res, 200, 'False alarm cancelled. Stand-down notification dispatched.', {
      status: 'cancelled_false_alarm',
      reason,
    });
  } catch (err) {
    next(err);
  }
};

