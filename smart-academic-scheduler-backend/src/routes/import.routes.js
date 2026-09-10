const express = require('express');
const multer = require('multer');
const importController = require('../controllers/import.controller');
const { protect, authorize } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants/appConstants');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

router.use(protect);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.post('/', upload.single('file'), importController.handleImport);

module.exports = router;
