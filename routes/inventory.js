const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Inventory CRUD routes
router.post('/', inventoryController.createInventoryItem);         // Create a new inventory item
router.get('/', inventoryController.getAllInventoryItems);         // Get all inventory items
router.get('/:id', inventoryController.getInventoryItemById);      // Get a specific inventory item by ID
router.put('/:id', inventoryController.updateInventoryItem);       // Update an inventory item by ID
router.delete('/:id', inventoryController.deleteInventoryItem);    // Delete an inventory item by ID

// New endpoint to get inventory by branch
router.get('/branch/:branch_id', inventoryController.getInventoryItemsByBranch);  // Get inventory items by branch

module.exports = router;
