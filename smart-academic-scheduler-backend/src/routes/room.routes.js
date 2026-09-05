const express = require('express');
const roomController = require('../controllers/room.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const { createRoomValidator, updateRoomValidator } = require('../validators/room.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);

router.get('/', paginationValidator, validate, roomController.list);
router.get('/:id', validateObjectId('id'), validate, roomController.getById);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  createRoomValidator,
  validate,
  roomController.create
);

router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  updateRoomValidator,
  validate,
  roomController.update
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  roomController.remove
);

module.exports = router;
