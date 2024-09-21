// app.js
const express = require('express');
const app = express();
const cors = require('cors'); // Import cors

// Import routes
const suppliersRoutes = require('./routes/suppliers');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/user');
const inventoryRoutes = require('./routes/inventory'); 
const fuelPurchasesRoutes = require('./routes/fuelPurchases');  // Fuel Purchases Routes
const fuelSalesRoutes = require('./routes/fuelSales');  
const OrdersRoutes = require('./routes/orders');
const bidsRoutes = require('./routes/bids');
const ProcurementRoutes = require('./routes/procurement');
const EvaluateRoutes = require('./routes/evaluation');
const boqroutes = require('./routes/boq');
const dashboardRoutes = require('./routes/dashboard');



// Apply middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes); // Auth routes should not require authentication
app.use('/api/suppliers', suppliersRoutes); // Protect suppliers routes
app.use('/api/users', usersRoutes); // User CRUD routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/fuel-purchases', fuelPurchasesRoutes);
app.use('/api/fuel-sales', fuelSalesRoutes);
app.use('/api/orders', OrdersRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/procurement', ProcurementRoutes);
app.use('/api/evaluation', EvaluateRoutes);
app.use('/api/boq', boqroutes);
app.use('/api/dashboard', dashboardRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
