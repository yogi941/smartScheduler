const createCrudService = require('./base.service');
const roomRepository = require('../repositories/room.repository');

const roomService = createCrudService({
  repository: roomRepository,
  entityName: 'Room',
  populate: [],
});

module.exports = roomService;
