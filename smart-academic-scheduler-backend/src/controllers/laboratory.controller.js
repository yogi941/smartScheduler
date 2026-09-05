const createCrudController = require('./base.controller');
const laboratoryService = require('../services/laboratory.service');

function buildFilter(query) {
  const filter = {};
  if (query.department) {
    filter.department = query.department;
  }
  if (query.building) {
    filter.building = query.building;
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
  service: laboratoryService,
  entityName: 'Laboratory',
  buildFilter,
});
