// routes/fuelPurchases.js
const express = require('express');
const router = express.Router();
const fuelPurchasesController = require('../controllers/fuelPurchasesController');

// CRUD Routes for Fuel Purchases
router.post('/', fuelPurchasesController.createFuelPurchase);    // Create
router.get('/', fuelPurchasesController.getAllFuelPurchases);    // Read
router.put('/:id', fuelPurchasesController.updateFuelPurchase);  // Update
router.delete('/:id', fuelPurchasesController.deleteFuelPurchase); // Delete

module.exports = router;
