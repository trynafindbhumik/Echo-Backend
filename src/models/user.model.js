import { query } from '../config/db.js';

export const findUserByPhone = async (phoneNumber) => {
  const res = await query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
  return res.rows[0] || null;
};

export const findUserById = async (id) => {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const createUser = async ({ phoneNumber, name = 'Safety User', gender = null, fcmToken = null }) => {
  const res = await query(
    `INSERT INTO users (phone_number, name, gender, fcm_token)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [phoneNumber, name, gender, fcmToken]
  );
  return res.rows[0];
};

export const updateUserProfile = async (id, { name, gender, avatarUrl, hasCompletedEmergencySetup, isSilentSosEnabled, fcmToken }) => {
  const res = await query(
    `UPDATE users
     SET name = COALESCE($2, name),
         gender = COALESCE($3, gender),
         avatar_url = COALESCE($4, avatar_url),
         has_completed_emergency_setup = COALESCE($5, has_completed_emergency_setup),
         is_silent_sos_enabled = COALESCE($6, is_silent_sos_enabled),
         fcm_token = COALESCE($7, fcm_token)
     WHERE id = $1
     RETURNING *`,
    [id, name, gender, avatarUrl, hasCompletedEmergencySetup, isSilentSosEnabled, fcmToken]
  );
  return res.rows[0];
};
