const env = require('./src/config/env');
const logger = require('./src/config/logger');
const app = require('./src/app');
const { initializeDatabase, closeDatabaseConnection } = require('./src/database/connection');

let server;

function handleFatalError(error, origin) {
  logger.error(`Fatal error (${origin}): ${error.message}\n${error.stack}`);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => handleFatalError(error, 'uncaughtException'));
process.on('unhandledRejection', (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  handleFatalError(error, 'unhandledRejection');
});

async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await closeDatabaseConnection();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing process exit.');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

async function startServer() {
  try {
    await initializeDatabase();

    server = app.listen(env.port, () => {
      logger.info(`${env.appName} server running in ${env.nodeEnv} mode on port ${env.port}`);
      logger.info(`API base URL: http://localhost:${env.port}${env.apiPrefix}`);
      logger.info(`Health check: http://localhost:${env.port}/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}\n${error.stack}`);
    process.exit(1);
  }
}

startServer();

module.exports = server;
