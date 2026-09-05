const createCrudService = require('./base.service');
const courseRepository = require('../repositories/course.repository');
const { Department } = require('../models');
const ApiError = require('../utils/ApiError');

async function validateDepartment(data) {
  if (data.department) {
    const departmentExists = await Department.exists({ _id: data.department });
    if (!departmentExists) {
      throw ApiError.badRequest('department must reference an existing Department');
    }
  }
}

const courseService = createCrudService({
  repository: courseRepository,
  entityName: 'Course',
  populate: ['department'],
  beforeCreate: async (data) => {
    await validateDepartment(data);
  },
  beforeUpdate: async (updates) => {
    await validateDepartment(updates);
  },
});

module.exports = courseService;
