const createCrudController = require('./base.controller');
const userService = require('../services/user.service');

function buildFilter(query) {
  const filter = {};
  if (query.role) {
    filter.role = query.role;
  }
  if (query.department) {
    filter.department = query.department;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  return filter;
}

module.exports = createCrudController({
  service: userService,
  entityName: 'User',
  buildFilter,
});
