import { Router } from 'express';
import { body } from 'express-validator';
import {
  handleSendOtp,
  handleVerifyOtp,
  handleGoogleLogin,
  handleRefreshToken,
  handleUpdateFcmToken,
} from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { authGuard } from '../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/send-otp',
  [body('email').isEmail().withMessage('Valid email address is required')],
  validateRequest,
  handleSendOtp
);

router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email address is required'),
    body('otp').notEmpty().withMessage('OTP verification code is required'),
  ],
  validateRequest,
  handleVerifyOtp
);

router.post(
  '/google',
  [
    body('idToken').optional(),
    body('email').optional().isEmail(),
  ],
  validateRequest,
  handleGoogleLogin
);

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validateRequest,
  handleRefreshToken
);

router.post(
  '/fcm-token',
  authGuard,
  [body('fcmToken').notEmpty().withMessage('FCM token is required')],
  validateRequest,
  handleUpdateFcmToken
);

export default router;
