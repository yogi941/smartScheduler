const morgan = require('morgan');
const logger = require('../config/logger');
const env = require('../config/env');

const stream = {
  write: (message) => (logger.http ? logger.http(message.trim()) : logger.info(message.trim())),
};

const skip = () => env.isTest;

const morganFormat = env.isDevelopment
  ? ':method :url :status :res[content-length] - :response-time ms'
  : 'combined';

const requestLogger = morgan(morganFormat, { stream, skip });

module.exports = requestLogger;
