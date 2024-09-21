const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/total-fuel-sold', dashboardController.getTotalFuelSold);
router.get('/total-revenue', dashboardController.getTotalRevenue);
router.get('/available-fuel', dashboardController.getAvailableFuel);
router.get('/reorder-alerts', dashboardController.getReorderAlerts);
router.get('/total-purchase-costs', dashboardController.getTotalPurchaseCosts);
router.get('/fuel-sales-over-time', dashboardController.getFuelSalesOverTime); // Correct route
router.get('/revenue-vs-costs', dashboardController.getRevenueVsCosts);
router.get('/inventory-breakdown', dashboardController.getInventoryBreakdown);
router.get('/fuel-purchase-trends', dashboardController.getFuelPurchaseTrends);
router.get('/top-performing-fuel-types', dashboardController.getTopPerformingFuelTypes);
router.get('/supplier-performance', dashboardController.getSupplierPerformance);

module.exports = router;
