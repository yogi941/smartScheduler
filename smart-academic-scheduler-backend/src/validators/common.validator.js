const { param, query } = require('express-validator');
const mongoose = require('mongoose');

function validateObjectId(paramName = 'id') {
  return [
    param(paramName).custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`${paramName} must be a valid MongoDB ObjectId`);
      }
      return true;
    }),
  ];
}

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query('sort').optional().isString().withMessage('sort must be a string'),
];

module.exports = { validateObjectId, paginationValidator };
