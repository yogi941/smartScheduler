const { body } = require('express-validator');
const mongoose = require('mongoose');

const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;

const generateTimetableValidator = [
  body('batchIds')
    .isArray({ min: 1 })
    .withMessage('batchIds must be a non-empty array of StudentBatch ids'),
  body('batchIds.*')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('batchIds must only contain valid MongoDB ObjectIds'),
  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('academicYear is required')
    .matches(ACADEMIC_YEAR_REGEX)
    .withMessage('academicYear must be in the format YYYY-YYYY'),
];

module.exports = { generateTimetableValidator };
