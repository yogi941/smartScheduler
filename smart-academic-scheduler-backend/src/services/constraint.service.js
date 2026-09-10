const mongoose = require('mongoose');
const createCrudService = require('./base.service');
const constraintRepository = require('../repositories/constraint.repository');
const { TimeSlot } = require('../models');
const { APPLIES_TO_MODELS } = require('../models/Constraint.model');
const ApiError = require('../utils/ApiError');

async function validateAppliesTo(data) {
  if (!data.appliesToModel || !data.appliesTo) {
    return;
  }

  if (!APPLIES_TO_MODELS.includes(data.appliesToModel)) {
    throw ApiError.badRequest(`appliesToModel must be one of: ${APPLIES_TO_MODELS.join(', ')}`);
  }

  const TargetModel = mongoose.model(data.appliesToModel);
  const targetExists = await TargetModel.exists({ _id: data.appliesTo });

  if (!targetExists) {
    throw ApiError.badRequest(`appliesTo must reference an existing ${data.appliesToModel}`);
  }
}

async function validateTimeSlot(data) {
  if (data.timeSlot) {
    const timeSlotExists = await TimeSlot.exists({ _id: data.timeSlot });
    if (!timeSlotExists) {
      throw ApiError.badRequest('timeSlot must reference an existing TimeSlot');
    }
  }
}

const constraintService = createCrudService({
  repository: constraintRepository,
  entityName: 'Constraint',
  populate: ['appliesTo', 'timeSlot', 'createdBy'],
  beforeCreate: async (data) => {
    await validateAppliesTo(data);
    await validateTimeSlot(data);
  },
  beforeUpdate: async (updates) => {
    await validateAppliesTo(updates);
    await validateTimeSlot(updates);
  },
});

module.exports = constraintService;
