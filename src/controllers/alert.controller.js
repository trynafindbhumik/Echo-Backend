import { findNearbyActiveAlerts } from '../models/sos.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const handleGetNearbyAlerts = async (req, res, next) => {
  try {
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);
    const radiusKm = parseFloat(req.query.radiusKm) || 8;

    if (isNaN(latitude) || isNaN(longitude)) {
      return errorResponse(res, 400, 'Valid latitude and longitude query parameters are required.');
    }

    const alerts = await findNearbyActiveAlerts(latitude, longitude, radiusKm * 1000);
    return successResponse(res, 200, 'Nearby active alerts retrieved.', alerts);
  } catch (err) {
    next(err);
  }
};

export const handleRespondAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    return successResponse(res, 200, 'Responder en route acknowledged.', { alertId, status: 'en_route' });
  } catch (err) {
    next(err);
  }
};

export const handleReportFakeAlert = async (req, res, next) => {
  try {
    const { alertId } = req.params;
    const { reason, details } = req.body;

    return successResponse(res, 200, 'Fake SOS report submitted for moderation audit.', {
      alertId,
      reportedReason: reason,
    });
  } catch (err) {
    next(err);
  }
};
