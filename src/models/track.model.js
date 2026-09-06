import { query } from '../config/db.js';

export const createTrackingSession = async ({ userId, shareCode, expiresAt }) => {
  const res = await query(
    `INSERT INTO tracking_sessions (user_id, share_code, expires_at, is_active)
     VALUES ($1, $2, $3, TRUE)
     RETURNING *`,
    [userId, shareCode, expiresAt]
  );
  return res.rows[0];
};

export const findTrackingSessionByShareCode = async (shareCode) => {
  const res = await query(
    `SELECT * FROM tracking_sessions
     WHERE share_code = $1 AND is_active = TRUE AND expires_at > CURRENT_TIMESTAMP`,
    [shareCode]
  );
  return res.rows[0] || null;
};
