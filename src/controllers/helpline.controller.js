import { getHelplinesList } from '../models/helpline.model.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Handles fetching the emergency helplines catalog.
 */
export const handleGetHelplines = async (req, res, next) => {
  try {
    const helplines = await getHelplinesList();
    return successResponse(res, 200, 'Helplines retrieved successfully.', helplines);
  } catch (err) {
    next(err);
  }
};
