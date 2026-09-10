const express = require('express');
const auditLogController = require('../controllers/auditLog.controller');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/', auditLogController.getLogs);

module.exports = router;
