const { body } = require('express-validator');
const mongoose = require('mongoose');

const createLaboratoryValidator = [
  body('labName')
    .trim()
    .notEmpty()
    .withMessage('labName is required')
    .isLength({ max: 150 })
    .withMessage('labName cannot exceed 150 characters'),
  body('labCode')
    .trim()
    .notEmpty()
    .withMessage('labCode is required')
    .isLength({ max: 20 })
    .withMessage('labCode cannot exceed 20 characters'),
  body('department')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('building')
    .trim()
    .notEmpty()
    .withMessage('building is required')
    .isLength({ max: 100 })
    .withMessage('building cannot exceed 100 characters'),
  body('floor')
    .notEmpty()
    .withMessage('floor is required')
    .isInt({ min: 0 })
    .withMessage('floor must be a non-negative integer'),
  body('capacity')
    .notEmpty()
    .withMessage('capacity is required')
    .isInt({ min: 1 })
    .withMessage('capacity must be a positive integer'),
  body('equipment').optional().isArray().withMessage('equipment must be an array of strings'),
  body('equipment.*').optional().isString().withMessage('each equipment entry must be a string'),
];

const updateLaboratoryValidator = [
  body('labName').optional().trim().isLength({ max: 150 }),
  body('labCode').optional().trim().isLength({ max: 20 }),
  body('department')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('building').optional().trim().isLength({ max: 100 }),
  body('floor').optional().isInt({ min: 0 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('equipment').optional().isArray(),
  body('equipment.*').optional().isString(),
  body('isActive').optional().isBoolean(),
];

module.exports = { createLaboratoryValidator, updateLaboratoryValidator };
