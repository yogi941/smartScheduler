const express = require('express');
const timeSlotController = require('../controllers/timeSlot.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const {
  createTimeSlotValidator,
  updateTimeSlotValidator,
} = require('../validators/timeSlot.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);

router.get('/', paginationValidator, validate, timeSlotController.list);
router.get('/:id', validateObjectId('id'), validate, timeSlotController.getById);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  createTimeSlotValidator,
  validate,
  timeSlotController.create
);

router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  updateTimeSlotValidator,
  validate,
  timeSlotController.update
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  timeSlotController.remove
);

module.exports = router;
