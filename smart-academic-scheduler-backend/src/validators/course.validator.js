const { body } = require('express-validator');
const mongoose = require('mongoose');

const createCourseValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Course name must be between 2 and 150 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Course code is required')
    .isLength({ min: 2, max: 15 })
    .withMessage('Course code must be between 2 and 15 characters'),
  body('department')
    .notEmpty()
    .withMessage('department is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('durationYears')
    .notEmpty()
    .withMessage('durationYears is required')
    .isInt({ min: 1, max: 6 })
    .withMessage('durationYears must be an integer between 1 and 6'),
  body('totalSemesters')
    .notEmpty()
    .withMessage('totalSemesters is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('totalSemesters must be an integer between 1 and 12'),
];

const updateCourseValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 150 }),
  body('code').optional().trim().isLength({ min: 2, max: 15 }),
  body('department')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('durationYears').optional().isInt({ min: 1, max: 6 }),
  body('totalSemesters').optional().isInt({ min: 1, max: 12 }),
  body('isActive').optional().isBoolean(),
];

module.exports = { createCourseValidator, updateCourseValidator };
