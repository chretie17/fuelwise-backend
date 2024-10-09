const db = require('../db');
const bcrypt = require('bcryptjs');

// Create a new user with optional branch association (for managers)
exports.createUser = (req, res) => {
  const { username, email, password, role, branch_id } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to hash password' });
    }

    // If the user is a manager, associate them with a branch
    const query = branch_id
      ? `INSERT INTO users (username, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)`
      : `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;

    const params = branch_id
      ? [username, email, hashedPassword, role, branch_id]
      : [username, email, hashedPassword, role];

    db.query(query, params, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    });
  });
};

// Get all users with branch info if available
exports.getAllUsers = (req, res) => {
  const query = `SELECT u.id, u.username, u.email, u.role, b.name as branch_name 
                 FROM users u 
                 LEFT JOIN branches b ON u.branch_id = b.id`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a specific user by ID with branch info if available
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT u.id, u.username, u.email, u.role, b.name as branch_name 
                 FROM users u 
                 LEFT JOIN branches b ON u.branch_id = b.id 
                 WHERE u.id = ?`;
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

// Update a user by ID with optional branch update for managers
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email, password, role, branch_id } = req.body;

  // Hash the new password if provided
  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to hash password' });
      }
      updateUser(id, username, email, hashedPassword, role, branch_id, res);
    });
  } else {
    updateUser(id, username, email, null, role, branch_id, res);
  }
};

// Helper function to update a user with optional branch
const updateUser = (id, username, email, hashedPassword, role, branch_id, res) => {
  const query = hashedPassword
    ? `UPDATE users SET username = ?, email = ?, password = ?, role = ?, branch_id = ? WHERE id = ?`
    : `UPDATE users SET username = ?, email = ?, role = ?, branch_id = ? WHERE id = ?`;

  const params = hashedPassword
    ? [username, email, hashedPassword, role, branch_id, id]
    : [username, email, role, branch_id, id];

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

// Get all users for a specific branch
exports.getUsersByBranch = (req, res) => {
  const { branch_id } = req.params;
  const query = `SELECT u.id, u.username, u.email, u.role 
                 FROM users u 
                 WHERE u.branch_id = ?`;
  db.query(query, [branch_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
