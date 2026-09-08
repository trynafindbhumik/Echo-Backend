import { Router } from 'express';
import { body } from 'express-validator';
import { handleGoogleLogin, handleVerifyOtp } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = Router();

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
  '/verify-otp',
  [
    body('phoneNumber').optional(),
  ],
  validateRequest,
  handleVerifyOtp
);

export default router;
