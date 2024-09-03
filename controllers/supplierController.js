// controllers/suppliersController.js
const db = require('../db');

// Create a new supplier
exports.createSupplier = (req, res) => {
  const { name, email, contact_details, certification, performance_history, price_per_liter } = req.body;
  const query = `INSERT INTO suppliers (name, email, contact_details, certification, performance_history, price_per_liter) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(query, [name, email, contact_details, certification, performance_history, price_per_liter], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Supplier created successfully', supplierId: result.insertId });
  });
};

// Get all suppliers
exports.getAllSuppliers = (req, res) => {
  const query = `SELECT * FROM suppliers`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a specific supplier by ID
exports.getSupplierById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM suppliers WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(results[0]);
  });
};

// Update a supplier by ID
exports.updateSupplier = (req, res) => {
  const { id } = req.params;
  const { name, email, contact_details, certification, performance_history, price_per_liter } = req.body;
  const query = `UPDATE suppliers SET name = ?, email = ?, contact_details = ?, certification = ?, performance_history = ?, price_per_liter = ? WHERE id = ?`;
  db.query(query, [name, email, contact_details, certification, performance_history, price_per_liter, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Supplier updated successfully' });
  });
};

// Delete a supplier by ID
exports.deleteSupplier = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM suppliers WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Supplier deleted successfully' });
  });
};
