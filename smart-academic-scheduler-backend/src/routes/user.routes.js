const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { validateObjectId, paginationValidator } = require('../validators/common.validator');
const { createUserValidator, updateUserValidator } = require('../validators/user.validator');
const { USER_ROLES } = require('../constants/appConstants');

const router = express.Router();

router.use(protect, authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/', paginationValidator, validate, userController.list);
router.get('/:id', validateObjectId('id'), validate, userController.getById);
router.post('/', createUserValidator, validate, userController.create);
router.patch('/:id', validateObjectId('id'), updateUserValidator, validate, userController.update);
router.delete('/:id', validateObjectId('id'), validate, userController.remove);

module.exports = router;
