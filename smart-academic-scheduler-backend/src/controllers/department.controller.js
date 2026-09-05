const createCrudController = require('./base.controller');
const departmentService = require('../services/department.service');

function buildFilter(query) {
  const filter = {};
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  return filter;
}

module.exports = createCrudController({
  service: departmentService,
  entityName: 'Department',
  buildFilter,
});
