// controllers/inventoryController.js
const db = require('../db');

// Create a new inventory item
exports.createInventoryItem = (req, res) => {
  const { fuel_type, liters, unit_price, supplier_id, date_received } = req.body;  // Changed 'quantity' to 'liters'
  const query = `INSERT INTO inventory (fuel_type, liters, unit_price, supplier_id, date_received) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [fuel_type, liters, unit_price, supplier_id, date_received], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Inventory item created successfully', inventoryId: result.insertId });
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
    res.json(results);
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
    res.json(results[0]);
  });
};

// Update an inventory item by ID
exports.updateInventoryItem = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, unit_price, supplier_id, date_received } = req.body;  // Changed 'quantity' to 'liters'
  const query = `UPDATE inventory SET fuel_type = ?, liters = ?, unit_price = ?, supplier_id = ?, date_received = ? WHERE id = ?`;
  db.query(query, [fuel_type, liters, unit_price, supplier_id, date_received, id], (err, result) => {
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
  
  // Get all fuel purchases
  exports.getAllFuelPurchases = (req, res) => {
    const query = `SELECT p.id, p.fuel_type, p.liters, p.total_cost, s.name as supplier_name, p.purchase_date 
                   FROM fuel_purchases p 
                   LEFT JOIN suppliers s ON p.supplier_id = s.id`;
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  };