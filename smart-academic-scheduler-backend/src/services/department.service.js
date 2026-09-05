const createCrudService = require('./base.service');
const departmentRepository = require('../repositories/department.repository');
const { Teacher } = require('../models');
const ApiError = require('../utils/ApiError');

async function validateHeadOfDepartment(data) {
  if (data.headOfDepartment) {
    const teacherExists = await Teacher.exists({ _id: data.headOfDepartment });
    if (!teacherExists) {
      throw ApiError.badRequest('headOfDepartment must reference an existing Teacher');
    }
  }
}

const departmentService = createCrudService({
  repository: departmentRepository,
  entityName: 'Department',
  populate: ['headOfDepartment'],
  beforeCreate: async (data) => {
    await validateHeadOfDepartment(data);
  },
  beforeUpdate: async (updates) => {
    await validateHeadOfDepartment(updates);
  },
});

module.exports = departmentService;
