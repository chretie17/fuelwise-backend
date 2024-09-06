const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/supplierController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Supplier CRUD routes
router.post('/', suppliersController.createSupplier);          // Create a new supplier
router.get('/', suppliersController.getAllSuppliers);          // Get all suppliers
router.get('/:id', suppliersController.getSupplierById);       // Get a specific supplier by ID
router.put('/:id', suppliersController.updateSupplier);        // Update a supplier by ID
router.delete('/:id', suppliersController.deleteSupplier);     // Delete a supplier by ID

// Supplier Authentication and Details routes
router.post('/signup', suppliersController.signupSupplier); // Signup route for new suppliers
router.post('/add-details', authenticateToken, suppliersController.addSupplierDetails); // Add supplier details
router.get('/my-details', authenticateToken, suppliersController.getSupplierDetails); // Get supplier details
router.put('/my-details', authenticateToken, suppliersController.updateSupplierDetails); // Update supplier details

module.exports = router;
