const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const bidsController = require('../controllers/bidsController');

// Route to submit a bid
router.post('/submit', authenticateToken, bidsController.submitBid);

// Route to evaluate bids and select the best supplier
router.post('/evaluate', authenticateToken, bidsController.evaluateBids);

// Route to get all bids for a specific fuel type
router.get('/:fuel_type', authenticateToken, bidsController.getAllBidsByFuelType);

// Route to delete a bid by ID
router.delete('/:id', authenticateToken, bidsController.deleteBid);

module.exports = router;
