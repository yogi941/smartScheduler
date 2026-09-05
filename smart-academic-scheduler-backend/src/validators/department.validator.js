const { body } = require('express-validator');
const mongoose = require('mongoose');

const createDepartmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Department name must be between 2 and 150 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Department code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Department code must be between 2 and 10 characters'),
  body('headOfDepartment')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('headOfDepartment must be a valid MongoDB ObjectId'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const updateDepartmentValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 150 }),
  body('code').optional().trim().isLength({ min: 2, max: 10 }),
  body('headOfDepartment')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('headOfDepartment must be a valid MongoDB ObjectId'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { createDepartmentValidator, updateDepartmentValidator };
