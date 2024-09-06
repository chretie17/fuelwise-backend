// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', authenticateToken, authController.registerUser);

// Login route
router.post('/login', authController.loginUser);

module.exports = router;
