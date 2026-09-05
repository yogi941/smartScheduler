const env = require('../config/env');

function refreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: `${env.apiPrefix}/auth`,
  };
}

module.exports = { refreshTokenCookieOptions };
