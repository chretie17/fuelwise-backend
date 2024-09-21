const db = require('../db');

// Get total fuel sales in liters
exports.getTotalFuelSold = (req, res) => {
  const query = `SELECT SUM(liters) AS total_fuel_sold FROM fuel_sales`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// Get total revenue from sales
exports.getTotalRevenue = (req, res) => {
  const query = `SELECT SUM(total_revenue) AS total_revenue FROM fuel_sales`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// Get available fuel in inventory
exports.getAvailableFuel = (req, res) => {
  const query = `SELECT SUM(liters) AS available_fuel FROM inventory`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// Get reorder alerts
exports.getReorderAlerts = (req, res) => {
  const query = `SELECT COUNT(*) AS reorder_alerts FROM inventory WHERE liters < 500`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// Get total purchase costs
exports.getTotalPurchaseCosts = (req, res) => {
  const query = `SELECT SUM(total_cost) AS total_purchase_costs FROM fuel_purchases`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// Get fuel sales over time
exports.getFuelSalesOverTime = (req, res) => {
  const query = `SELECT sale_date, SUM(liters) AS fuel_sold FROM fuel_sales GROUP BY sale_date ORDER BY sale_date`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get revenue vs. costs
exports.getRevenueVsCosts = (req, res) => {
  const query = `
    SELECT
      (SELECT SUM(total_revenue) FROM fuel_sales) AS total_revenue,
      (SELECT SUM(total_cost) FROM fuel_purchases) AS total_cost
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

// Get inventory breakdown by fuel type
exports.getInventoryBreakdown = (req, res) => {
  const query = `SELECT fuel_type, SUM(liters) AS total_liters FROM inventory GROUP BY fuel_type`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get fuel purchase trends over time
exports.getFuelPurchaseTrends = (req, res) => {
  const query = `SELECT purchase_date, SUM(liters) AS fuel_purchased FROM fuel_purchases GROUP BY purchase_date ORDER BY purchase_date`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get top performing fuel types
exports.getTopPerformingFuelTypes = (req, res) => {
  const query = `SELECT fuel_type, SUM(liters) AS fuel_sold FROM fuel_sales GROUP BY fuel_type ORDER BY fuel_sold DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Get supplier performance
exports.getSupplierPerformance = (req, res) => {
  const query = `SELECT s.name AS supplier_name, SUM(p.liters) AS total_fuel_provided FROM fuel_purchases p JOIN suppliers s ON p.supplier_id = s.id GROUP BY s.name ORDER BY total_fuel_provided DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
