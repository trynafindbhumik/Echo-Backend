import { query } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
};

export const findUserByPhone = async (phoneNumber) => {
  const res = await query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
  return res.rows[0] || null;
};

export const findUserById = async (id) => {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const createUser = async ({ email = null, phoneNumber = null, name = 'Safety User', gender = null, avatarUrl = null, fcmToken = null }) => {
  const res = await query(
    `INSERT INTO users (email, phone_number, name, gender, avatar_url, fcm_token)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [email, phoneNumber, name, gender, avatarUrl, fcmToken]
  );
  return res.rows[0];
};

export const updateUserProfile = async (id, { name, gender, avatarUrl, hasCompletedEmergencySetup, isSilentSosEnabled, fcmToken, email, phoneNumber }) => {
  if (fcmToken) {
    // Deduplicate FCM token across users (clear from other accounts on same device)
    await query('UPDATE users SET fcm_token = NULL WHERE fcm_token = $1 AND id != $2', [fcmToken, id]);
  }

  const res = await query(
    `UPDATE users
     SET name = COALESCE($2, name),
         gender = COALESCE($3, gender),
         avatar_url = COALESCE($4, avatar_url),
         has_completed_emergency_setup = COALESCE($5, has_completed_emergency_setup),
         is_silent_sos_enabled = COALESCE($6, is_silent_sos_enabled),
         fcm_token = COALESCE($7, fcm_token),
         email = COALESCE($8, email),
         phone_number = COALESCE($9, phone_number)
     WHERE id = $1
     RETURNING *`,
    [id, name, gender, avatarUrl, hasCompletedEmergencySetup, isSilentSosEnabled, fcmToken, email, phoneNumber]
  );
  return res.rows[0];
};

export const clearStaleFcmToken = async (fcmToken) => {
  if (!fcmToken) return;
  await query('UPDATE users SET fcm_token = NULL WHERE fcm_token = $1', [fcmToken]);
};

export const updateUserFcmToken = async (id, fcmToken) => {
  if (!fcmToken) return null;
  await query('UPDATE users SET fcm_token = NULL WHERE fcm_token = $1 AND id != $2', [fcmToken, id]);
  const res = await query('UPDATE users SET fcm_token = $1 WHERE id = $2 RETURNING *', [fcmToken, id]);
  return res.rows[0];
};

