const createCrudController = require('./base.controller');
const semesterService = require('../services/semester.service');

function buildFilter(query) {
  const filter = {};
  if (query.course) {
    filter.course = query.course;
  }
  if (query.academicYear) {
    filter.academicYear = query.academicYear;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  return filter;
}

module.exports = createCrudController({
  service: semesterService,
  entityName: 'Semester',
  buildFilter,
});
