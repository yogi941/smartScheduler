const createCrudController = require('./base.controller');
const courseService = require('../services/course.service');

function buildFilter(query) {
  const filter = {};
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
  service: courseService,
  entityName: 'Course',
  buildFilter,
});
