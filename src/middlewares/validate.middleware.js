import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failure.', errors.array());
  }
  next();
};
