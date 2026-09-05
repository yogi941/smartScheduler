const { body } = require('express-validator');
const mongoose = require('mongoose');

const CONSTRAINT_TYPES = [
  'TEACHER_AVAILABILITY',
  'ROOM_AVAILABILITY',
  'LAB_AVAILABILITY',
  'SUBJECT_HOURS',
  'LUNCH_BREAK',
  'HOLIDAY',
  'SEMESTER_RULE',
];

const APPLIES_TO_MODELS = ['Teacher', 'Room', 'Laboratory', 'StudentBatch', 'Subject', 'Semester'];
const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createConstraintValidator = [
  body('constraintType')
    .notEmpty()
    .withMessage('constraintType is required')
    .isIn(CONSTRAINT_TYPES)
    .withMessage(`constraintType must be one of: ${CONSTRAINT_TYPES.join(', ')}`),
  body('appliesToModel')
    .notEmpty()
    .withMessage('appliesToModel is required')
    .isIn(APPLIES_TO_MODELS)
    .withMessage(`appliesToModel must be one of: ${APPLIES_TO_MODELS.join(', ')}`),
  body('appliesTo')
    .notEmpty()
    .withMessage('appliesTo is required')
    .custom(isValidObjectId)
    .withMessage('appliesTo must be a valid MongoDB ObjectId'),
  body('day').optional().isIn(WEEK_DAYS).withMessage(`day must be one of: ${WEEK_DAYS.join(', ')}`),
  body('timeSlot').optional().custom(isValidObjectId).withMessage('timeSlot must be a valid MongoDB ObjectId'),
  body('date').optional().isISO8601().withMessage('date must be a valid ISO8601 date').toDate(),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('description is required')
    .isLength({ max: 300 })
    .withMessage('description cannot exceed 300 characters'),
  body('metadata').optional().isObject().withMessage('metadata must be an object'),
];

const updateConstraintValidator = [
  body('constraintType').optional().isIn(CONSTRAINT_TYPES),
  body('appliesToModel').optional().isIn(APPLIES_TO_MODELS),
  body('appliesTo').optional().custom(isValidObjectId),
  body('day').optional().isIn(WEEK_DAYS),
  body('timeSlot').optional().custom(isValidObjectId),
  body('date').optional().isISO8601().toDate(),
  body('description').optional().trim().isLength({ max: 300 }),
  body('metadata').optional().isObject(),
  body('isActive').optional().isBoolean(),
];

module.exports = { createConstraintValidator, updateConstraintValidator };
