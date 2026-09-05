const { body } = require('express-validator');
const mongoose = require('mongoose');

const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;

const createSemesterValidator = [
  body('semesterNumber')
    .notEmpty()
    .withMessage('semesterNumber is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('semesterNumber must be an integer between 1 and 12'),
  body('course')
    .notEmpty()
    .withMessage('course is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('course must be a valid MongoDB ObjectId'),
  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('academicYear is required')
    .matches(ACADEMIC_YEAR_REGEX)
    .withMessage('academicYear must be in the format YYYY-YYYY'),
  body('startDate').notEmpty().withMessage('startDate is required').isISO8601().toDate(),
  body('endDate')
    .notEmpty()
    .withMessage('endDate is required')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => new Date(value) > new Date(req.body.startDate))
    .withMessage('endDate must be after startDate'),
];

const updateSemesterValidator = [
  body('semesterNumber').optional().isInt({ min: 1, max: 12 }),
  body('course')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('course must be a valid MongoDB ObjectId'),
  body('academicYear').optional().trim().matches(ACADEMIC_YEAR_REGEX),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('isActive').optional().isBoolean(),
];

module.exports = { createSemesterValidator, updateSemesterValidator };
