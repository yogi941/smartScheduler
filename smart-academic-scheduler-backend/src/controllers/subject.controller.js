const createCrudController = require('./base.controller');
const subjectService = require('../services/subject.service');

function buildFilter(query) {
  const filter = {};
  if (query.department) {
    filter.department = query.department;
  }
  if (query.semester) {
    filter.semester = query.semester;
  }
  if (query.subjectType) {
    filter.subjectType = query.subjectType;
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
  service: subjectService,
  entityName: 'Subject',
  buildFilter,
});
