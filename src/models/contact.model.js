import { query } from '../config/db.js';

export const getContactsByUserId = async (userId) => {
  const res = await query('SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY is_primary DESC, created_at ASC', [userId]);
  return res.rows;
};

export const addEmergencyContact = async (userId, { name, phoneNumber, relationship, isPrimary = false }) => {
  if (isPrimary) {
    // Unmark existing primary contact if setting a new primary
    await query('UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = $1', [userId]);
  }

  const res = await query(
    `INSERT INTO emergency_contacts (user_id, name, phone_number, relationship, is_primary)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, name, phoneNumber, relationship, isPrimary]
  );
  return res.rows[0];
};

export const deleteEmergencyContact = async (contactId, userId) => {
  const res = await query('DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING *', [contactId, userId]);
  return res.rows[0] || null;
};
