const express = require('express');
const router = express.Router();
const boqController = require('../controllers/boqcontroller');

// BOQ CRUD operations
router.post('/', boqController.createBOQ);
router.get('/', boqController.getAllBOQItems);
router.get('/:id', boqController.getBOQItemById);
router.put('/:id', boqController.updateBOQItem);
router.delete('/:id', boqController.deleteBOQItem);

module.exports = router;
