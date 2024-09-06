const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const procurementController = require('../controllers/procurementController');

// Route to get the current budget (Admin only)
router.get('/budget', authenticateToken, procurementController.getBudget);

// Route to set the budget (Admin only)
router.post('/set-budget', authenticateToken, procurementController.setBudget);

module.exports = router;
