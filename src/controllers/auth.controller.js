import jwt from 'jsonwebtoken';
import { verifyPhoneOtp } from '../services/sms.service.js';
import { findUserByPhone, createUser } from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const handleVerifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp, firebaseIdToken, idToken, fcmToken } = req.body;

    const tokenToVerify = firebaseIdToken || idToken;
    const verification = await verifyPhoneOtp(phoneNumber, otp, tokenToVerify);

    if (!verification.verified) {
      return errorResponse(res, 400, verification.message);
    }

    const targetPhone = verification.phoneNumber || phoneNumber || `+0000000000`;
    let user = await findUserByPhone(targetPhone);
    if (!user) {
      user = await createUser({ phoneNumber: targetPhone, fcmToken });
    }

    const tokenPayload = { id: user.id, phoneNumber: user.phone_number };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret_key', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });

    return successResponse(res, 200, 'Authentication successful.', {
      token,
      refreshToken,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        name: user.name,
        gender: user.gender,
        avatarUrl: user.avatar_url,
        hasCompletedEmergencySetup: user.has_completed_emergency_setup,
        isSilentSosEnabled: user.is_silent_sos_enabled,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};
