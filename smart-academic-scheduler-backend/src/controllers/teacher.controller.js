const createCrudController = require('./base.controller');
const teacherService = require('../services/teacher.service');

function buildFilter(query) {
  const filter = {};
  if (query.department) {
    filter.department = query.department;
  }
  if (query.designation) {
    filter.designation = query.designation;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  return filter;
}

module.exports = createCrudController({
  service: teacherService,
  entityName: 'Teacher',
  buildFilter,
});
