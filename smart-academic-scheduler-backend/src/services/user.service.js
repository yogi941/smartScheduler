const createCrudService = require('./base.service');
const createRepository = require('../repositories/base.repository');
const { User, Teacher } = require('../models');
const { USER_ROLES } = require('../constants/appConstants');
const ApiError = require('../utils/ApiError');

const userRepository = createRepository(User);

async function validateUniqueEmail(data) {
  if (data.email) {
    const existing = await User.exists({ email: data.email.toLowerCase().trim() });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }
  }
}

async function guardRoleChange(updates, existing) {
  if (updates.role && updates.role !== existing.role && existing.role === USER_ROLES.TEACHER) {
    const stillLinked = await Teacher.exists({ user: existing._id });
    if (stillLinked) {
      throw ApiError.conflict(
        'Cannot change the role of a User that still has a linked Teacher profile. Remove or reassign the Teacher profile first.'
      );
    }
  }
}

const userService = createCrudService({
  repository: userRepository,
  entityName: 'User',
  populate: ['department'],
  beforeCreate: async (data) => {
    await validateUniqueEmail(data);
  },
  beforeUpdate: async (updates, existing) => {
    await guardRoleChange(updates, existing);
  },
});

module.exports = userService;
