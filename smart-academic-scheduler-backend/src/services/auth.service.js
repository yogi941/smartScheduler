const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { USER_ROLES } = require('../constants/appConstants');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const userRepository = require('../repositories/user.repository');

function buildTokenPayload(user) {
  return { sub: user._id.toString(), role: user.role };
}

async function issueTokenPair(user) {
  const accessToken = generateAccessToken(buildTokenPayload(user));
  const refreshToken = generateRefreshToken(buildTokenPayload(user));
  const hashedRefreshToken = await bcrypt.hash(refreshToken, env.bcrypt.saltRounds);
  await userRepository.updateRefreshToken(user._id, hashedRefreshToken);
  return { accessToken, refreshToken };
}

async function registerUser(payload) {
  const emailTaken = await userRepository.existsByEmail(payload.email);
  if (emailTaken) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const safePayload = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    role: USER_ROLES.STUDENT,
  };

  const user = await userRepository.createUser(safePayload);
  const { accessToken, refreshToken } = await issueTokenPair(user);

  return { user, accessToken, refreshToken };
}

async function loginUser(email, password) {
  const user = await userRepository.findByEmail(email, true);

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated. Contact an administrator.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);
  await userRepository.updateLastLogin(user._id);
  user.password = undefined;

  return { user, accessToken, refreshToken };
}

async function refreshAccessToken(incomingRefreshToken) {
  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  let payload;
  try {
    payload = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
  }

  const user = await userRepository.findByIdWithRefreshToken(payload.sub);

  if (!user || !user.refreshToken) {
    throw ApiError.unauthorized('Refresh token is invalid. Please log in again.');
  }

  const tokenMatches = await bcrypt.compare(incomingRefreshToken, user.refreshToken);

  if (!tokenMatches) {
    await userRepository.updateRefreshToken(user._id, null);
    throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return { accessToken, refreshToken };
}

async function logoutUser(userId) {
  await userRepository.updateRefreshToken(userId, null);
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
