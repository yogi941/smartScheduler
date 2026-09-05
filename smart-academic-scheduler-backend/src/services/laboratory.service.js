const createCrudService = require('./base.service');
const laboratoryRepository = require('../repositories/laboratory.repository');
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

const laboratoryService = createCrudService({
  repository: laboratoryRepository,
  entityName: 'Laboratory',
  populate: ['department'],
  beforeCreate: async (data) => {
    await validateDepartment(data);
  },
  beforeUpdate: async (updates) => {
    await validateDepartment(updates);
  },
});

module.exports = laboratoryService;
