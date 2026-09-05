const { body } = require('express-validator');

const ROOM_TYPES = ['CLASSROOM', 'SEMINAR_HALL', 'AUDITORIUM'];

const createRoomValidator = [
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('roomNumber is required')
    .isLength({ max: 20 })
    .withMessage('roomNumber cannot exceed 20 characters'),
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
  body('roomType').optional().isIn(ROOM_TYPES).withMessage(`roomType must be one of: ${ROOM_TYPES.join(', ')}`),
  body('hasProjector').optional().isBoolean().withMessage('hasProjector must be a boolean'),
];

const updateRoomValidator = [
  body('roomNumber').optional().trim().isLength({ max: 20 }),
  body('building').optional().trim().isLength({ max: 100 }),
  body('floor').optional().isInt({ min: 0 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('roomType').optional().isIn(ROOM_TYPES),
  body('hasProjector').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

module.exports = { createRoomValidator, updateRoomValidator };
