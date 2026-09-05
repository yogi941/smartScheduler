const createCrudService = require('./base.service');
const timeSlotRepository = require('../repositories/timeSlot.repository');

const timeSlotService = createCrudService({
  repository: timeSlotRepository,
  entityName: 'TimeSlot',
  populate: [],
});

module.exports = timeSlotService;
