// controllers/suppliersController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Supplier signup
exports.signupSupplier = (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to hash password' });
    }

    // Insert new supplier user in the users table
    const userQuery = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'supplier')`;
    db.query(userQuery, [username, email, hashedPassword], (userErr, userResult) => {
      if (userErr) {
        return res.status(500).json({ error: userErr.message });
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: userResult.insertId, role: 'supplier' }, 'your_secret_key', { expiresIn: '1h' });

      res.status(201).json({ message: 'Supplier registered successfully', token });
    });
  });
};

// Add supplier details after signup
exports.addSupplierDetails = (req, res) => {
  const userId = req.user.userId; // Use userId from the JWT token
  const { contact_details, certification, performance_history, price_per_liter } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Insert new supplier details in the suppliers table
  const supplierQuery = `
    INSERT INTO suppliers (name, email, contact_details, certification, performance_history, price_per_liter, user_id)
    SELECT username, email, ?, ?, ?, ?, id FROM users WHERE id = ? AND role = 'supplier'
  `;
  db.query(supplierQuery, [contact_details, certification, performance_history, price_per_liter, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error adding supplier details' });
    }
    res.status(201).json({ message: 'Supplier details added successfully' });
  });
};
// Fetch supplier details by user_id
// controllers/suppliersController.js
exports.getSupplierDetails = (req, res) => {
  const userId = req.user.userId; // Assuming JWT middleware has set req.user

  // Query to fetch supplier details by user ID
  const query = `SELECT * FROM suppliers WHERE user_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching supplier details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(results[0]); // Return supplier details
  });
};


// Update supplier details by user_id
exports.updateSupplierDetails = (req, res) => {
  const userId = req.user.userId; // Use userId from the JWT token
  const { name, contact_details, certification, performance_history, price_per_liter } = req.body;

  const query = `
    UPDATE suppliers 
    SET name = ?, contact_details = ?, certification = ?, performance_history = ?, price_per_liter = ? 
    WHERE user_id = ?
  `;
  
  db.query(query, [name, contact_details, certification, performance_history, price_per_liter, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating supplier details' });
    }

    res.json({ message: 'Supplier details updated successfully' });
  });
};
