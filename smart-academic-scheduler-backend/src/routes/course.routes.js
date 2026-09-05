const express = require('express');
const courseController = require('../controllers/course.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const { createCourseValidator, updateCourseValidator } = require('../validators/course.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);

router.get('/', paginationValidator, validate, courseController.list);
router.get('/:id', validateObjectId('id'), validate, courseController.getById);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  createCourseValidator,
  validate,
  courseController.create
);

router.patch(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  updateCourseValidator,
  validate,
  courseController.update
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  courseController.remove
);

module.exports = router;
