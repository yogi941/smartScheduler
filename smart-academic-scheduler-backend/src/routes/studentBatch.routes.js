const express = require('express');
const studentBatchController = require('../controllers/studentBatch.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const {
  createStudentBatchValidator,
  updateStudentBatchValidator,
} = require('../validators/studentBatch.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);

router.get('/', paginationValidator, validate, studentBatchController.list);
router.get('/:id', validateObjectId('id'), validate, studentBatchController.getById);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  createStudentBatchValidator,
  validate,
  studentBatchController.create
);

router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  updateStudentBatchValidator,
  validate,
  studentBatchController.update
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  studentBatchController.remove
);

module.exports = router;
