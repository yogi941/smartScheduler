const createCrudService = require('./base.service');
const teacherRepository = require('../repositories/teacher.repository');
const { User, Department, Subject, Teacher } = require('../models');
const ApiError = require('../utils/ApiError');
const { USER_ROLES } = require('../constants/appConstants');

async function validateOnCreate(data) {
  if (!data.user) {
    return;
  }

  const user = await User.findById(data.user);
  if (!user) {
    throw ApiError.badRequest('user must reference an existing User');
  }

  if (user.role !== USER_ROLES.TEACHER) {
    throw ApiError.badRequest('The referenced user must have the TEACHER role');
  }

  const alreadyLinked = await Teacher.exists({ user: data.user });
  if (alreadyLinked) {
    throw ApiError.conflict('This user is already linked to a Teacher profile');
  }

  await validateSharedFields(data);
}

async function validateOnUpdate(updates) {
  await validateSharedFields(updates);
}

async function validateSharedFields(data) {
  if (data.department) {
    const departmentExists = await Department.exists({ _id: data.department });
    if (!departmentExists) {
      throw ApiError.badRequest('department must reference an existing Department');
    }
  }

  if (data.subjectsCanTeach && data.subjectsCanTeach.length > 0) {
    const count = await Subject.countDocuments({ _id: { $in: data.subjectsCanTeach } });
    if (count !== data.subjectsCanTeach.length) {
      throw ApiError.badRequest('subjectsCanTeach contains one or more invalid Subject ids');
    }
  }
}

const teacherService = createCrudService({
  repository: teacherRepository,
  entityName: 'Teacher',
  populate: ['user', 'department', 'subjectsCanTeach'],
  beforeCreate: async (data) => {
    await validateOnCreate(data);
  },
  beforeUpdate: async (updates) => {
    await validateOnUpdate(updates);
  },
});

module.exports = teacherService;
