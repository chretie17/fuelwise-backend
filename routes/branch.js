const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');  // Assuming the controller is in the 'controllers' folder

// Create a new branch
router.post('/', branchController.createBranch);

// Get all branches
router.get('/', branchController.getAllBranches);

// Get a specific branch by ID
router.get('/:id', branchController.getBranchById);

// Update a branch by ID
router.put('/:id', branchController.updateBranch);

// Delete a branch by ID
router.delete('/:id', branchController.deleteBranch);

module.exports = router;
