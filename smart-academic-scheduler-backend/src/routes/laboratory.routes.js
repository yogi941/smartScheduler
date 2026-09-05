const express = require('express');
const laboratoryController = require('../controllers/laboratory.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const {
  createLaboratoryValidator,
  updateLaboratoryValidator,
} = require('../validators/laboratory.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);

router.get('/', paginationValidator, validate, laboratoryController.list);
router.get('/:id', validateObjectId('id'), validate, laboratoryController.getById);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  createLaboratoryValidator,
  validate,
  laboratoryController.create
);

router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  updateLaboratoryValidator,
  validate,
  laboratoryController.update
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  laboratoryController.remove
);

module.exports = router;
