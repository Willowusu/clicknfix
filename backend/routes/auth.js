const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

// Get logged-in user profile
router.get('/profile', authenticateToken, authController.getProfile);

// Update profile details
router.put('/profile/update',authenticateToken, authController.updateProfile);

// Request password reset
router.post('/password/reset', authController.requestPasswordReset);

// Change password
router.post('/password/change',authenticateToken, authController.changePassword);

module.exports = router;