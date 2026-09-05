const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

mongoose.set('strictQuery', true);

async function connectDatabase(retryAttempt = 1) {
  try {
    await mongoose.connect(env.mongo.uri, {
      autoIndex: !env.isProduction,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20,
      minPoolSize: 2,
    });

    logger.info(
      `MongoDB connected successfully -> host: ${mongoose.connection.host}, db: ${mongoose.connection.name}`
    );
  } catch (error) {
    logger.error(`MongoDB connection attempt ${retryAttempt} failed: ${error.message}`);

    if (retryAttempt >= MAX_RETRY_ATTEMPTS) {
      logger.error('MongoDB connection failed after maximum retry attempts. Exiting process.');
      process.exit(1);
    }

    logger.warn(
      `Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s (attempt ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})...`
    );

    await new Promise((resolve) => {
      setTimeout(resolve, RETRY_DELAY_MS);
    });

    return connectDatabase(retryAttempt + 1);
  }

  return mongoose.connection;
}

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connection established.');
});

mongoose.connection.on('error', (error) => {
  logger.error(`Mongoose connection error: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose connection disconnected.');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed due to application termination (SIGINT).');
  process.exit(0);
});

module.exports = connectDatabase;
