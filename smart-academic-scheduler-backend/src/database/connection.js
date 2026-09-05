const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const logger = require('../config/logger');

async function initializeDatabase() {
  const connection = await connectDatabase();
  return connection;
}

function getDatabaseHealth() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = mongoose.connection.readyState;

  return {
    status: states[state] || 'unknown',
    healthy: state === 1,
  };
}

async function closeDatabaseConnection() {
  await mongoose.connection.close();
  logger.info('Database connection closed gracefully.');
}

module.exports = {
  initializeDatabase,
  getDatabaseHealth,
  closeDatabaseConnection,
};
