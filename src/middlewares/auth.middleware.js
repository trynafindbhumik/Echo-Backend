import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiResponse.js';

export const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Unauthorized access. No authorization token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 401, 'Invalid, expired, or malformed authorization token.');
  }
};
