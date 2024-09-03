// routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');

// Routes for user CRUD operations
router.post('/', usersController.createUser);      
router.get('/', usersController.getAllUsers);       
router.get('/:id', usersController.getUserById);   
router.put('/:id', usersController.updateUser);     
router.delete('/:id', usersController.deleteUser);  

module.exports = router;
