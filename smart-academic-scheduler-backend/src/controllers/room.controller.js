const createCrudController = require('./base.controller');
const roomService = require('../services/room.service');

function buildFilter(query) {
  const filter = {};
  if (query.building) {
    filter.building = query.building;
  }
  if (query.roomType) {
    filter.roomType = query.roomType;
  }
  if (query.minCapacity) {
    filter.capacity = { $gte: Number(query.minCapacity) };
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  return filter;
}

module.exports = createCrudController({
  service: roomService,
  entityName: 'Room',
  buildFilter,
});
