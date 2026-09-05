const { body } = require('express-validator');
const mongoose = require('mongoose');

const SUBJECT_TYPES = ['THEORY', 'LAB', 'THEORY_AND_LAB'];

const createSubjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Subject name must be between 2 and 150 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Subject code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Subject code must be between 2 and 20 characters'),
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
  body('credits')
    .notEmpty()
    .withMessage('credits is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('credits must be an integer between 1 and 10'),
  body('subjectType')
    .notEmpty()
    .withMessage('subjectType is required')
    .isIn(SUBJECT_TYPES)
    .withMessage(`subjectType must be one of: ${SUBJECT_TYPES.join(', ')}`),
  body('weeklyLectureHours')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('weeklyLectureHours must be an integer between 0 and 20'),
  body('weeklyLabHours')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('weeklyLabHours must be an integer between 0 and 20'),
];

const updateSubjectValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 150 }),
  body('code').optional().trim().isLength({ min: 2, max: 20 }),
  body('department')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('semester')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('semester must be a valid MongoDB ObjectId'),
  body('credits').optional().isInt({ min: 1, max: 10 }),
  body('subjectType').optional().isIn(SUBJECT_TYPES),
  body('weeklyLectureHours').optional().isInt({ min: 0, max: 20 }),
  body('weeklyLabHours').optional().isInt({ min: 0, max: 20 }),
  body('isActive').optional().isBoolean(),
];

module.exports = { createSubjectValidator, updateSubjectValidator };
