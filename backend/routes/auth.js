const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/user', auth, authController.getUser);
router.put('/update', auth, authController.updateUser);
router.delete('/delete', auth, authController.deleteUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-token', authController.verifyToken);

module.exports = router;