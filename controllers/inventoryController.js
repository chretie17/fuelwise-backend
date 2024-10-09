const db = require('../db');

// Create a new inventory item with branch
exports.createInventoryItem = (req, res) => {
  const { fuel_type, liters, unit_price, date_received, branch_id } = req.body;
  const query = `INSERT INTO inventory (fuel_type, liters, unit_price, date_received, branch_id) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [fuel_type, liters, unit_price, date_received, branch_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Inventory item created successfully', inventoryId: result.insertId });
  });
};


// Get inventory items by branch
exports.getInventoryItemsByBranch = (req, res) => {
  const { branch_id } = req.params; // branch_id will be passed as a route parameter
  const query = `SELECT i.id, i.fuel_type, i.liters, i.unit_price, s.name as supplier_name, b.name as branch_name, i.date_received, i.date_updated 
                 FROM inventory i 
                 LEFT JOIN suppliers s ON i.supplier_id = s.id 
                 LEFT JOIN branches b ON i.branch_id = b.id
                 WHERE i.branch_id = ?`; // Only fetch inventory for the specified branch
  db.query(query, [branch_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedResults = formatDatesInResult(results); // Format dates
    res.json(formattedResults);
  });
};

// Helper function to format dates
const formatDatesInResult = (results) => {
  return results.map(item => {
    item.date_received = new Date(item.date_received).toISOString().split('T')[0]; // Ensure date is in YYYY-MM-DD format
    if (item.date_updated) {
      item.date_updated = new Date(item.date_updated).toISOString().split('T')[0];
    }
    return item;
  });
};

// Get all branches
exports.getAllBranches = (req, res) => {
  const query = `SELECT * FROM branches`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // Return all branches
  });
};

// Get all inventory items
exports.getAllInventoryItems = (req, res) => {
  const query = `SELECT i.id, i.fuel_type, i.liters, i.unit_price, s.name as supplier_name, i.date_received, i.date_updated 
                 FROM inventory i 
                 LEFT JOIN suppliers s ON i.supplier_id = s.id`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedResults = formatDatesInResult(results); // Format dates
    res.json(formattedResults);
  });
};

// Get a specific inventory item by ID
exports.getInventoryItemById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM inventory WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    const formattedResults = formatDatesInResult(results); // Format dates
    res.json(formattedResults[0]);
  });
};

// Update an inventory item by ID
exports.updateInventoryItem = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, unit_price, date_received, branch_id } = req.body;
  const query = `UPDATE inventory SET fuel_type = ?, liters = ?, unit_price = ?, date_received = ?, branch_id = ? WHERE id = ?`;
  db.query(query, [fuel_type, liters, unit_price, date_received, branch_id, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Inventory item updated successfully' });
  });
};

// Delete an inventory item by ID
exports.deleteInventoryItem = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM inventory WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  });
};

// Create a new fuel purchase
exports.createFuelPurchase = (req, res) => {
  const { fuel_type, liters, total_cost, supplier_id, purchase_date } = req.body;
  const query = `INSERT INTO fuel_purchases (fuel_type, liters, total_cost, supplier_id, purchase_date) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [fuel_type, liters, total_cost, supplier_id, purchase_date], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Fuel purchase recorded successfully', purchaseId: result.insertId });
  });
};

// Helper function to format dates for fuel purchases
const formatFuelPurchaseDates = (results) => {
  return results.map(item => {
    item.purchase_date = new Date(item.purchase_date).toISOString().split('T')[0]; // Ensure proper date formatting (YYYY-MM-DD)
    return item;
  });
};

// Get all fuel purchases
exports.getAllFuelPurchases = (req, res) => {
  const query = `SELECT p.id, p.fuel_type, p.liters, p.total_cost, s.name as supplier_name, p.purchase_date 
                 FROM fuel_purchases p 
                 LEFT JOIN suppliers s ON p.supplier_id = s.id`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedResults = formatFuelPurchaseDates(results); // Format dates
    res.json(formattedResults);
  });
};
