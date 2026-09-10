const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication token is missing');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Authentication token has expired');
    }
    throw ApiError.unauthorized('Invalid authentication token');
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This user account has been deactivated');
  }

  req.user = user;
  return next();
});

const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }

    return next();
  };

module.exports = { protect, authorize };
