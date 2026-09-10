import { Router } from 'express';
import { handleGetHelplines } from '../controllers/helpline.controller.js';

const router = Router();

router.get('/', handleGetHelplines);

export default router;
