import { Router } from 'express';
import { handleGetProfile, handleUpdateProfile } from '../controllers/user.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', authGuard, handleGetProfile);
router.patch('/me', authGuard, handleUpdateProfile);

export default router;
