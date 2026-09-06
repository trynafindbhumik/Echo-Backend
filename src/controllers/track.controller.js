import { createTrackingSession, findTrackingSessionByShareCode } from '../models/track.model.js';
import { updateLiveLocationInRedis } from '../services/geo.service.js';
import { getIO } from '../sockets/index.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import crypto from 'crypto';

/**
 * Creates a temporary live tracking session and shareable URL.
 */
export const handleStartTrackingSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { durationHours = 2, contactIds = [] } = req.body;

    const shareCode = crypto.randomBytes(8).toString('hex');
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);

    const session = await createTrackingSession({ userId, shareCode, expiresAt });

    return successResponse(res, 201, 'Live location tracking session started.', {
      sessionId: session.share_code,
      shareLink: `https://echo.app/track/${session.share_code}`,
      expiresAt: session.expires_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetches tracking session details by public share code.
 */
export const handleGetTrackingSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await findTrackingSessionByShareCode(sessionId);

    if (!session) {
      return errorResponse(res, 404, 'Tracking session expired or invalid.');
    }

    return successResponse(res, 200, 'Tracking session details fetched.', {
      sessionId: session.share_code,
      isActive: session.is_active,
      expiresAt: session.expires_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * HTTPS REST location update fallback handler for when WebSocket disconnects.
 */
export const handlePostLocationUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, alertId, entityType = 'bystander' } = req.body;

    await updateLiveLocationInRedis(userId, entityType, latitude, longitude);

    const io = getIO();
    if (io && alertId) {
      io.to(`alert:${alertId}`).emit('location_updated', {
        userId,
        entityType,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        via: 'http_fallback',
      });
    }

    return successResponse(res, 200, 'Location updated successfully via HTTPS REST.', {
      userId,
      entityType,
      latitude,
      longitude,
      alertId: alertId || null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * HTTPS REST batched location sync handler for offline reconnection sync.
 */
export const handleBatchLocationUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { locations, alertId, entityType = 'bystander' } = req.body;

    if (!Array.isArray(locations) || locations.length === 0) {
      return errorResponse(res, 400, 'Locations array must contain at least one location entry.');
    }

    const latestLocation = locations[locations.length - 1];
    await updateLiveLocationInRedis(userId, entityType, latestLocation.latitude, latestLocation.longitude);

    const io = getIO();
    if (io && alertId) {
      io.to(`alert:${alertId}`).emit('location_updated', {
        userId,
        entityType,
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        timestamp: latestLocation.timestamp || new Date().toISOString(),
        via: 'http_batch_fallback',
      });
    }

    return successResponse(res, 200, 'Batch locations processed successfully.', {
      processedCount: locations.length,
      latestLocation,
      alertId: alertId || null,
    });
  } catch (err) {
    next(err);
  }
};


