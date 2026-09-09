import { query } from '../config/db.js';

export const createSosAlert = async ({ userId, latitude, longitude, address, isSilent = false }) => {
  const res = await query(
    `INSERT INTO sos_alerts (user_id, status, location, address, is_silent)
     VALUES ($1, 'active', ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography, $4, $5)
     RETURNING id, user_id, status, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude, address, is_silent, created_at`,
    [userId, latitude, longitude, address, isSilent]
  );
  return res.rows[0];
};

export const findActiveSosAlertByUserId = async (userId) => {
  const res = await query(
    `SELECT id, user_id, status, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude, address, is_silent, created_at
     FROM sos_alerts
     WHERE user_id = $1 AND status = 'active'
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return res.rows[0] || null;
};

export const findSosAlertById = async (alertId) => {
  const res = await query(
    `SELECT id, user_id, status, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude, address, is_silent, audio_record_url, created_at
     FROM sos_alerts
     WHERE id = $1`,
    [alertId]
  );
  return res.rows[0] || null;
};

export const updateSosAudioRecordUrl = async (alertId, userId, audioRecordUrl) => {
  const res = await query(
    `UPDATE sos_alerts
     SET audio_record_url = $3
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [alertId, userId, audioRecordUrl]
  );
  return res.rows[0];
};

export const resolveSosAlert = async (alertId, userId) => {
  const res = await query(
    `UPDATE sos_alerts
     SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [alertId, userId]
  );
  return res.rows[0];
};

export const cancelFalseAlarmSosAlert = async (alertId, userId) => {
  const res = await query(
    `UPDATE sos_alerts
     SET status = 'cancelled', resolved_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [alertId, userId]
  );
  return res.rows[0];
};

/**
 * Performs a PostGIS spatial query to find active emergency alerts within a given radius.
 * @param {number} latitude - Target latitude
 * @param {number} longitude - Target longitude
 * @param {number} [radiusMeters=8000] - Query radius in meters
 * @returns {Promise<Array<object>>} Active incidents sorted by distance
 */
export const findNearbyActiveAlerts = async (latitude, longitude, radiusMeters = 8000) => {
  const res = await query(
    `SELECT a.id, a.user_id as "userId", u.name as "userName",
            ST_Y(a.location::geometry) as latitude,
            ST_X(a.location::geometry) as longitude,
            a.address, a.status, a.created_at as timestamp,
            ST_Distance(a.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) / 1000.0 as "distanceKm"
     FROM sos_alerts a
     JOIN users u ON a.user_id = u.id
     WHERE a.status = 'active'
       AND ST_DWithin(a.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)
     ORDER BY "distanceKm" ASC`,
    [latitude, longitude, radiusMeters]
  );
  return res.rows;
};

