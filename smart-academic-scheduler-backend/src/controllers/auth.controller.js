const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');
const { refreshTokenCookieOptions } = require('../utils/cookieOptions');

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions());

  return ApiResponse.created(res, { user, accessToken }, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions());

  return ApiResponse.ok(res, { user, accessToken }, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(
    incomingRefreshToken
  );

  res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions());

  return ApiResponse.ok(res, { accessToken }, 'Access token refreshed successfully');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.id);
  res.clearCookie('refreshToken', { path: refreshTokenCookieOptions().path });

  return ApiResponse.ok(res, null, 'Logout successful');
});

const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.ok(res, { user: req.user }, 'Current user fetched successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
