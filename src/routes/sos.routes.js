import { Router } from 'express';
import { body } from 'express-validator';
import { handleTriggerSos, handleUploadAudioSnippet, handleResolveSos, handleCancelFalseAlarm } from '../controllers/sos.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = Router();

router.post(
  '/trigger',
  authGuard,
  [
    body('latitude').isNumeric().withMessage('Valid latitude is required.'),
    body('longitude').isNumeric().withMessage('Valid longitude is required.'),
  ],
  validateRequest,
  handleTriggerSos
);

router.post('/:alertId/audio', authGuard, upload.single('file'), handleUploadAudioSnippet);

router.post('/:alertId/resolve', authGuard, handleResolveSos);

router.post('/:alertId/cancel-false-alarm', authGuard, handleCancelFalseAlarm);

export default router;
