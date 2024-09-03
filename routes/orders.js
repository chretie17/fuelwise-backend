// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordersController');

// CRUD Routes for Orders
router.post('/', orderController.createOrder);    // Create
router.get('/', orderController.getAllOrders);    // Read
router.put('/:id', orderController.updateOrder);  // Update
router.delete('/:id', orderController.deleteOrder); // Delete

module.exports = router;
