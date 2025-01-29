// routes/fuelSales.js
const express = require('express');
const router = express.Router();
const fuelSalesController = require('../controllers/fuelSalesController');

// CRUD Routes for Fuel Sales
router.post('/', fuelSalesController.createFuelSale);          // Create
router.get('/', fuelSalesController.getAllFuelSales);          // Read
router.put('/:id', fuelSalesController.updateFuelSale);        // Update
router.delete('/:id', fuelSalesController.deleteFuelSale);     // Delete
// Assuming branch_id is passed as a query parameter
router.get('/branch/:branch_id', fuelSalesController.getSalesByBranch);
router.get('/all-with-branch', fuelSalesController.getAllFuelSalesWithBranch);
router.get('/admin/sales', fuelSalesController.getAllFuelSalesForAdmin);

module.exports = router;
