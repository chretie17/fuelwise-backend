// controllers/usersController.js
const db = require('../db');
const bcrypt = require('bcryptjs');

// Create a new user
exports.createUser = (req, res) => {
  const { username, email, password, role } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to hash password' });
    }

    const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
    db.query(query, [username, email, hashedPassword, role], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    });
  });
};

// Get all users
exports.getAllUsers = (req, res) => {
  const query = `SELECT id, username, email, role FROM users`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a specific user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT id, username, email, role FROM users WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
};

// Update a user by ID
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  // Hash the new password if provided
  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to hash password' });
      }
      updateUser(id, username, email, hashedPassword, role, res);
    });
  } else {
    updateUser(id, username, email, null, role, res);
  }
};

// Helper function to update a user
const updateUser = (id, username, email, hashedPassword, role, res) => {
  const query = hashedPassword
    ? `UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?`
    : `UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?`;

  const params = hashedPassword
    ? [username, email, hashedPassword, role, id]
    : [username, email, role, id];

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User updated successfully' });
  });
};

// Delete a user by ID
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM users WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User deleted successfully' });
  });
};
