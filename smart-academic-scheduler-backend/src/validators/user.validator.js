const { body } = require('express-validator');
const { USER_ROLES } = require('../constants/appConstants');
const mongoose = require('mongoose');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`),
  body('department')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
];

const updateUserValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('role').optional().isIn(Object.values(USER_ROLES)),
  body('department')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('department must be a valid MongoDB ObjectId'),
  body('phone').optional().matches(/^[0-9]{10}$/),
  body('isActive').optional().isBoolean(),
];

module.exports = { createUserValidator, updateUserValidator };
