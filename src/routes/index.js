import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import contactRoutes from './contact.routes.js';
import sosRoutes from './sos.routes.js';
import alertRoutes from './alert.routes.js';
import trackRoutes from './track.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contacts', contactRoutes);
router.use('/sos', sosRoutes);
router.use('/alerts', alertRoutes);
router.use('/track', trackRoutes);

export default router;
