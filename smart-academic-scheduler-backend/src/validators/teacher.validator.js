const { body } = require('express-validator');
const mongoose = require('mongoose');

const DESIGNATIONS = [
  'PROFESSOR',
  'ASSOCIATE_PROFESSOR',
  'ASSISTANT_PROFESSOR',
  'LECTURER',
  'LAB_INSTRUCTOR',
];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createTeacherValidator = [
  body('user')
    .notEmpty()
    .withMessage('user is required')
    .custom(isValidObjectId)
    .withMessage('user must be a valid MongoDB ObjectId'),
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('employeeId is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('employeeId must be between 2 and 30 characters'),
  body('department')
    .notEmpty()
    .withMessage('department is required')
    .custom(isValidObjectId)
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('designation')
    .notEmpty()
    .withMessage('designation is required')
    .isIn(DESIGNATIONS)
    .withMessage(`designation must be one of: ${DESIGNATIONS.join(', ')}`),
  body('subjectsCanTeach')
    .optional()
    .isArray()
    .withMessage('subjectsCanTeach must be an array of Subject ids'),
  body('subjectsCanTeach.*')
    .optional()
    .custom(isValidObjectId)
    .withMessage('subjectsCanTeach must only contain valid MongoDB ObjectIds'),
  body('maxWeeklyHours')
    .optional()
    .isInt({ min: 1, max: 40 })
    .withMessage('maxWeeklyHours must be an integer between 1 and 40'),
];

const updateTeacherValidator = [
  body('employeeId').optional().trim().isLength({ min: 2, max: 30 }),
  body('department').optional().custom(isValidObjectId),
  body('designation').optional().isIn(DESIGNATIONS),
  body('subjectsCanTeach').optional().isArray(),
  body('subjectsCanTeach.*').optional().custom(isValidObjectId),
  body('maxWeeklyHours').optional().isInt({ min: 1, max: 40 }),
  body('isActive').optional().isBoolean(),
];

module.exports = { createTeacherValidator, updateTeacherValidator };
