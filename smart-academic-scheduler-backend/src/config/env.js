const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { NODE_ENVIRONMENTS } = require('../constants/appConstants');

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === null || value.trim() === '';
  });

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[ENV VALIDATION FAILED] Missing required environment variables: ${missing.join(', ')}`
    );
    process.exit(1);
  }
}

validateEnv();

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || NODE_ENVIRONMENTS.DEVELOPMENT,
  port: Number(process.env.PORT) || 5000,
  appName: process.env.APP_NAME || 'Smart Academic Scheduler',
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  mongo: {
    uri:
      process.env.NODE_ENV === NODE_ENVIRONMENTS.TEST
        ? process.env.MONGO_URI_TEST || process.env.MONGO_URI
        : process.env.MONGO_URI,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },

  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },

  isDevelopment:
    (process.env.NODE_ENV || NODE_ENVIRONMENTS.DEVELOPMENT) === NODE_ENVIRONMENTS.DEVELOPMENT,
  isProduction: process.env.NODE_ENV === NODE_ENVIRONMENTS.PRODUCTION,
  isTest: process.env.NODE_ENV === NODE_ENVIRONMENTS.TEST,
});

module.exports = env;
