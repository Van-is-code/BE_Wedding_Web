const express = require('express');
const { authenticate } = require('../middlewares/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);
router.post('/change-password', authenticate, userController.changePassword);

module.exports = router;
