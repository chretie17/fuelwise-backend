const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

// Route to evaluate bids for a specific BOQ
router.get('/evaluate/:boq_id', evaluationController.evaluateBids);
router.post('/select-supplier', evaluationController.selectSupplier);

module.exports = router;
