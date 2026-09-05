const createCrudController = require('./base.controller');
const constraintService = require('../services/constraint.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

function buildFilter(query) {
  const filter = {};
  if (query.constraintType) {
    filter.constraintType = query.constraintType;
  }
  if (query.appliesToModel) {
    filter.appliesToModel = query.appliesToModel;
  }
  if (query.appliesTo) {
    filter.appliesTo = query.appliesTo;
  }
  if (query.day) {
    filter.day = query.day;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  return filter;
}

const baseController = createCrudController({
  service: constraintService,
  entityName: 'Constraint',
  buildFilter,
});

const create = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user.id };
  const doc = await constraintService.create(payload);
  return ApiResponse.created(res, doc, 'Constraint created successfully');
});

module.exports = { ...baseController, create };
