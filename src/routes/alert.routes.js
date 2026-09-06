import { Router } from 'express';
import { handleGetNearbyAlerts, handleRespondAlert, handleReportFakeAlert } from '../controllers/alert.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/nearby', authGuard, handleGetNearbyAlerts);
router.post('/:alertId/respond', authGuard, handleRespondAlert);
router.post('/:alertId/report-fake', authGuard, handleReportFakeAlert);

export default router;
