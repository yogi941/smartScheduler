const createCrudController = require('./base.controller');
const studentBatchService = require('../services/studentBatch.service');

function buildFilter(query) {
  const filter = {};
  if (query.department) {
    filter.department = query.department;
  }
  if (query.semester) {
    filter.semester = query.semester;
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
  service: studentBatchService,
  entityName: 'Student Batch',
  buildFilter,
});
