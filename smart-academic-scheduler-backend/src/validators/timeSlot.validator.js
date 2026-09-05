const { body } = require('express-validator');

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const SLOT_TYPES = ['LECTURE', 'LAB', 'BREAK', 'LUNCH'];
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createTimeSlotValidator = [
  body('day')
    .notEmpty()
    .withMessage('day is required')
    .isIn(WEEK_DAYS)
    .withMessage(`day must be one of: ${WEEK_DAYS.join(', ')}`),
  body('slotIndex')
    .notEmpty()
    .withMessage('slotIndex is required')
    .isInt({ min: 1 })
    .withMessage('slotIndex must be a positive integer'),
  body('startTime')
    .notEmpty()
    .withMessage('startTime is required')
    .matches(TIME_REGEX)
    .withMessage('startTime must be in HH:mm 24-hour format'),
  body('endTime')
    .notEmpty()
    .withMessage('endTime is required')
    .matches(TIME_REGEX)
    .withMessage('endTime must be in HH:mm 24-hour format')
    .custom((value, { req }) => value > req.body.startTime)
    .withMessage('endTime must be after startTime'),
  body('slotType')
    .optional()
    .isIn(SLOT_TYPES)
    .withMessage(`slotType must be one of: ${SLOT_TYPES.join(', ')}`),
];

const updateTimeSlotValidator = [
  body('day').optional().isIn(WEEK_DAYS),
  body('slotIndex').optional().isInt({ min: 1 }),
  body('startTime').optional().matches(TIME_REGEX),
  body('endTime').optional().matches(TIME_REGEX),
  body('slotType').optional().isIn(SLOT_TYPES),
  body('isActive').optional().isBoolean(),
];

module.exports = { createTimeSlotValidator, updateTimeSlotValidator };
