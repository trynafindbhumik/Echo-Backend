import { createSosAlert, updateSosAudioRecordUrl, resolveSosAlert, cancelFalseAlarmSosAlert } from '../models/sos.model.js';
import { getContactsByUserId } from '../models/contact.model.js';
import { sendEmergencyPushNotification } from '../services/fcm.service.js';
import { uploadAudioSnippet } from '../services/storage.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Triggers a high-priority emergency SOS alert and dispatches FCM notifications to emergency contacts.
 */
export const handleTriggerSos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, address, isSilent } = req.body;

    const sosAlert = await createSosAlert({ userId, latitude, longitude, address, isSilent });
    const contacts = await getContactsByUserId(userId);

    const contactFcmTokens = contacts.map(c => c.fcm_token).filter(Boolean);
    if (contactFcmTokens.length > 0) {
      await sendEmergencyPushNotification({
        fcmTokens: contactFcmTokens,
        title: '🚨 EMERGENCY SOS ALERT',
        body: `EMERGENCY! Emergency contact has triggered an SOS alert at ${address || 'current location'}.`,
        data: { alertId: sosAlert.id, latitude: String(latitude), longitude: String(longitude) },
      });
    }

    return successResponse(res, 201, 'SOS Alert triggered successfully.', {
      alertId: sosAlert.id,
      status: sosAlert.status,
      contactsNotifiedCount: contacts.length,
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

