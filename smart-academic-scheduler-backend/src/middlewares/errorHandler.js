const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

function normalizeError(err) {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation failed', errors);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid value for field '${err.path}': ${err.value}`
    );
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return new ApiError(
      HTTP_STATUS.CONFLICT,
      `Duplicate value for '${field}': '${value}' already exists`
    );
  }

  if (err.name === 'JsonWebTokenError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication token has expired');
  }

  return new ApiError(
    err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    err.message || 'Internal Server Error',
    [],
    false,
    err.stack
  );
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const apiError = normalizeError(err);

  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    statusCode: apiError.statusCode,
    message: apiError.message,
    isOperational: apiError.isOperational,
  };

  if (apiError.statusCode >= 500) {
    logger.error(`${JSON.stringify(logPayload)}\n${apiError.stack}`);
  } else {
    logger.warn(JSON.stringify(logPayload));
  }

  const responseBody = {
    success: false,
    statusCode: apiError.statusCode,
    message: apiError.message,
    errors: apiError.errors && apiError.errors.length > 0 ? apiError.errors : undefined,
  };

  if (env.isDevelopment) {
    responseBody.stack = apiError.stack;
  }

  res.status(apiError.statusCode).json(responseBody);
}

module.exports = errorHandler;
