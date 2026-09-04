import { Router } from 'express';
import { body } from 'express-validator';
import { handleGetContacts, handleAddContact, handleDeleteContact } from '../controllers/contact.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/', authGuard, handleGetContacts);
router.post(
  '/',
  authGuard,
  [
    body('name').notEmpty().withMessage('Contact name is required.'),
    body('phoneNumber').notEmpty().withMessage('Contact phoneNumber is required.'),
    body('relationship').notEmpty().withMessage('Relationship is required.'),
  ],
  validateRequest,
  handleAddContact
);
router.delete('/:contactId', authGuard, handleDeleteContact);

export default router;
