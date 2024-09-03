// routes/suppliers.js
const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/supplierController');

// Supplier CRUD routes
router.post('/', suppliersController.createSupplier);          // Create a new supplier
router.get('/', suppliersController.getAllSuppliers);          // Get all suppliers
router.get('/:id', suppliersController.getSupplierById);       // Get a specific supplier by ID
router.put('/:id', suppliersController.updateSupplier);        // Update a supplier by ID
router.delete('/:id', suppliersController.deleteSupplier);     // Delete a supplier by ID

module.exports = router;
