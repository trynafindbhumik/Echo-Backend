import { Router } from 'express';
import { body } from 'express-validator';
import {
  handleStartTrackingSession,
  handleGetTrackingSession,
  handlePostLocationUpdate,
  handleBatchLocationUpdate,
} from '../controllers/track.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/start', authGuard, handleStartTrackingSession);

// HTTPS REST Location Update Fallback
router.post(
  '/location',
  authGuard,
  [
    body('latitude').isNumeric().withMessage('Valid latitude is required.'),
    body('longitude').isNumeric().withMessage('Valid longitude is required.'),
  ],
  validateRequest,
  handlePostLocationUpdate
);

// HTTPS REST Batched Location Update Fallback (offline sync)
router.post(
  '/location/batch',
  authGuard,
  [
    body('locations').isArray({ min: 1 }).withMessage('locations array with at least 1 entry is required.'),
    body('locations.*.latitude').isNumeric().withMessage('Each location entry must have a valid latitude.'),
    body('locations.*.longitude').isNumeric().withMessage('Each location entry must have a valid longitude.'),
  ],
  validateRequest,
  handleBatchLocationUpdate
);

router.get('/:sessionId', handleGetTrackingSession);

export default router;

