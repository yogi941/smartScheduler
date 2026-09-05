const express = require('express');
const constraintController = require('../controllers/constraint.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const {
  createConstraintValidator,
  updateConstraintValidator,
} = require('../validators/constraint.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);

router.get('/', paginationValidator, validate, constraintController.list);
router.get('/:id', validateObjectId('id'), validate, constraintController.getById);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  createConstraintValidator,
  validate,
  constraintController.create
);

router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  updateConstraintValidator,
  validate,
  constraintController.update
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  constraintController.remove
);

module.exports = router;
