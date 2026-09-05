const { body } = require('express-validator');
const mongoose = require('mongoose');

const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;

const createStudentBatchValidator = [
  body('batchName')
    .trim()
    .notEmpty()
    .withMessage('batchName is required')
    .isLength({ max: 50 })
    .withMessage('batchName cannot exceed 50 characters'),
  body('department')
    .notEmpty()
    .withMessage('department is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('semester')
    .notEmpty()
    .withMessage('semester is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('semester must be a valid MongoDB ObjectId'),
  body('section')
    .trim()
    .notEmpty()
    .withMessage('section is required')
    .isLength({ max: 5 })
    .withMessage('section cannot exceed 5 characters'),
  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('academicYear is required')
    .matches(ACADEMIC_YEAR_REGEX)
    .withMessage('academicYear must be in the format YYYY-YYYY'),
  body('strength')
    .notEmpty()
    .withMessage('strength is required')
    .isInt({ min: 1 })
    .withMessage('strength must be a positive integer'),
];

const updateStudentBatchValidator = [
  body('batchName').optional().trim().isLength({ max: 50 }),
  body('department')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('semester')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('semester must be a valid MongoDB ObjectId'),
  body('section').optional().trim().isLength({ max: 5 }),
  body('academicYear').optional().trim().matches(ACADEMIC_YEAR_REGEX),
  body('strength').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
];

module.exports = { createStudentBatchValidator, updateStudentBatchValidator };
