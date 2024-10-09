// routes/report.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Route to get branch report (filtered by date range)
router.get('/branch-report', reportController.getBranchReport);

// Route to get branch revenue report
router.get('/branch-revenue', reportController.getBranchRevenueReport);

// Route to get monthly sales report
router.get('/monthly-sales', reportController.getMonthlySalesReport);

// Route to get remaining fuel inventory report
router.get('/inventory-report', reportController.getInventoryReport);
router.get('/:reportType/overall', reportController.getReport);  // Overall report
router.get('/:reportType', reportController.getReport);  
module.exports = router;
