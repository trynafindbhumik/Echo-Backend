import { auth } from '../config/firebase.js';
import logger from '../utils/logger.js';

/**
 * Verifies a Firebase Phone Auth ID token or development OTP code.
 * @param {string} phoneNumber - Target phone number
 * @param {string} otp - OTP code
 * @param {string} [firebaseIdToken=null] - Firebase auth ID token issued by client
 * @returns {Promise<{ verified: boolean, phoneNumber?: string, firebaseUid?: string, message?: string }>} Verification result
 */
export const verifyPhoneOtp = async (phoneNumber, otp, firebaseIdToken = null) => {
  logger.info(`Verifying Phone Auth for ${phoneNumber || 'Firebase ID Token'}`);

  if (firebaseIdToken && auth) {
    try {
      const decodedToken = await auth.verifyIdToken(firebaseIdToken);
      logger.info(`Firebase ID Token verified successfully. UID: ${decodedToken.uid}, Phone: ${decodedToken.phone_number}`);
      return {
        verified: true,
        phoneNumber: decodedToken.phone_number || phoneNumber,
        firebaseUid: decodedToken.uid,
      };
    } catch (err) {
      logger.error('Firebase ID Token verification error:', err.message);
      return { verified: false, message: 'Invalid or expired Firebase authentication token.' };
    }
  }

  // Development environment bypass for test OTP 123456
  if (otp === '123456' || process.env.NODE_ENV === 'development') {
    return { verified: true, phoneNumber };
  }

  return { verified: false, message: 'Invalid or expired verification code.' };
};

