const db = require('../db');

// Create a new branch
exports.createBranch = (req, res) => {
  const { name, location } = req.body;
  const query = `INSERT INTO branches (name, location) VALUES (?, ?)`;
  db.query(query, [name, location], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Branch created successfully', branchId: result.insertId });
  });
};

// Get all branches
exports.getAllBranches = (req, res) => {
  const query = `SELECT * FROM branches`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a branch by ID
exports.getBranchById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM branches WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json(results[0]);
  });
};

// Update a branch by ID
exports.updateBranch = (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  const query = `UPDATE branches SET name = ?, location = ? WHERE id = ?`;
  db.query(query, [name, location, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ message: 'Branch updated successfully' });
  });
};

// Delete a branch by ID
exports.deleteBranch = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM branches WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted successfully' });
  });
};
