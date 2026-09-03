/**
 * Sends a standardized JSON success response.
 * @param {import('express').Response} res - Express response object
 * @param {number} [statusCode=200] - HTTP status code
 * @param {string} [message='Success'] - Response message
 * @param {any} [data=null] - Payload object or array
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized JSON error response.
 * @param {import('express').Response} res - Express response object
 * @param {number} [statusCode=500] - HTTP status code
 * @param {string} [message='Internal Server Error'] - Error summary message
 * @param {any} [errors=null] - Detailed error payload or validation array
 */
export const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors !== null) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

