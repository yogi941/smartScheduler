const createCrudController = require('./base.controller');
const timeSlotService = require('../services/timeSlot.service');

function buildFilter(query) {
  const filter = {};
  if (query.day) {
    filter.day = query.day;
  }
  if (query.slotType) {
    filter.slotType = query.slotType;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  return filter;
}

module.exports = createCrudController({
  service: timeSlotService,
  entityName: 'TimeSlot',
  buildFilter,
});
