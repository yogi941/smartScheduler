const createCrudService = require('./base.service');
const studentBatchRepository = require('../repositories/studentBatch.repository');
const { Department, Semester } = require('../models');
const ApiError = require('../utils/ApiError');

async function validateForeignKeys(data) {
  if (data.department) {
    const departmentExists = await Department.exists({ _id: data.department });
    if (!departmentExists) {
      throw ApiError.badRequest('department must reference an existing Department');
    }
  }

  if (data.semester) {
    const semesterExists = await Semester.exists({ _id: data.semester });
    if (!semesterExists) {
      throw ApiError.badRequest('semester must reference an existing Semester');
    }
  }
}

const studentBatchService = createCrudService({
  repository: studentBatchRepository,
  entityName: 'Student Batch',
  populate: ['department', 'semester'],
  beforeCreate: async (data) => {
    await validateForeignKeys(data);
  },
  beforeUpdate: async (updates) => {
    await validateForeignKeys(updates);
  },
});

module.exports = studentBatchService;
