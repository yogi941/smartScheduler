const { Server } = require('socket.io');
const logger = require('../config/logger');
const env = require('../config/env');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.cors.clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    socket.on('join_timetable', (timetableId) => {
      socket.join(`timetable_${timetableId}`);
      logger.info(`Socket ${socket.id} joined room timetable_${timetableId}`);
    });

    socket.on('leave_timetable', (timetableId) => {
      socket.leave(`timetable_${timetableId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    logger.warn('Socket.IO requested before initialization');
  }
  return io;
}

function notifyTimetableEvent(event, data) {
  if (io) {
    io.emit(event, data);
    if (data.timetableId) {
      io.to(`timetable_${data.timetableId}`).emit(event, data);
    }
  }
}

module.exports = {
  initSocket,
  getIO,
  notifyTimetableEvent,
};
