const express = require('express');
const router = express.Router();
const bidsController = require('../controllers/bidsController');

router.post('/submit', bidsController.submitBid);
router.get('/boq/:boq_id', bidsController.getBidsByBOQ);
router.get('/', bidsController.getAllBids);


module.exports = router;
