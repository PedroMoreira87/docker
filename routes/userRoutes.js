const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router();

router.get('/', authController.authenticateToken, authController.getAllUsers);
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/token', authController.verifyRefreshToken)

module.exports = router;
