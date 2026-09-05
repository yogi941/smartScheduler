const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { protect } = require('../middlewares/auth');
const { authRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authRateLimiter, registerValidator, validate, authController.register);
router.post('/login', authRateLimiter, loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
