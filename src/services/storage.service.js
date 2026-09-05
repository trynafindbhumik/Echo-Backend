import cloudinary from '../config/cloudinary.js';
import logger from '../utils/logger.js';
import fs from 'fs';

/**
 * Uploads an emergency audio snippet to Cloudinary storage and removes the local temp file.
 * @param {string} filePath - Absolute path to local temp file
 * @param {string} alertId - SOS alert identifier
 * @returns {Promise<string>} Secure Cloudinary CDN URL
 */
export const uploadAudioSnippet = async (filePath, alertId) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      logger.warn('Cloudinary not configured. Returning fallback audio URL.');
      return `https://cdn.echo.app/audio/${alertId}.m4a`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video', // Cloudinary processes audio files under the video resource type
      folder: 'echo_sos/audio_records',
      public_id: `sos_${alertId}_${Date.now()}`,
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (err) {
    logger.error('Failed to upload audio snippet to Cloudinary:', err);
    throw err;
  }
};

/**
 * Uploads a user profile avatar image to Cloudinary storage.
 * @param {string} filePath - Absolute path to local temp image file
 * @param {string} userId - User identifier
 * @returns {Promise<string>} Secure Cloudinary CDN URL
 */
export const uploadAvatarImage = async (filePath, userId) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return `https://cdn.echo.app/avatars/${userId}.jpg`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'echo_sos/avatars',
      public_id: `usr_${userId}`,
      overwrite: true,
      transformation: [{ width: 300, height: 300, crop: 'fill' }],
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (err) {
    logger.error('Failed to upload avatar image to Cloudinary:', err);
    throw err;
  }
};

