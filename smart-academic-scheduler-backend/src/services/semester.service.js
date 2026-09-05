const createCrudService = require('./base.service');
const semesterRepository = require('../repositories/semester.repository');
const { Course } = require('../models');
const ApiError = require('../utils/ApiError');

async function validateCourse(data) {
  if (data.course) {
    const courseExists = await Course.exists({ _id: data.course });
    if (!courseExists) {
      throw ApiError.badRequest('course must reference an existing Course');
    }
  }
}

const semesterService = createCrudService({
  repository: semesterRepository,
  entityName: 'Semester',
  populate: ['course'],
  beforeCreate: async (data) => {
    await validateCourse(data);
  },
  beforeUpdate: async (updates) => {
    await validateCourse(updates);
  },
});

module.exports = semesterService;
