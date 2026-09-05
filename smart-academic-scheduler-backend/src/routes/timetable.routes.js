const express = require('express');
const timetableController = require('../controllers/timetable.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const { generateTimetableValidator } = require('../validators/timetable.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);

router.get('/', paginationValidator, validate, timetableController.list);
router.get('/:id', validateObjectId('id'), validate, timetableController.getById);
router.get(
  '/:id/export/pdf',
  validateObjectId('id'),
  validate,
  timetableController.exportPdf
);
router.get(
  '/:id/export/excel',
  validateObjectId('id'),
  validate,
  timetableController.exportExcel
);

router.post(
  '/generate',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  generateTimetableValidator,
  validate,
  timetableController.generate
);

router.patch(
  '/:id/publish',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  timetableController.publish
);

router.patch(
  '/:id/archive',
  authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateObjectId('id'),
  validate,
  timetableController.archive
);

module.exports = router;
