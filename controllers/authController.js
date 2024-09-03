// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user (Admin only)
exports.registerUser = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add users' });
  }

  const { username, email, password, role } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to hash password' });
    }

    const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
    db.query(query, [username, email, hashedPassword, role], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

// User login
// controllers/authController.js
exports.loginUser = (req, res) => {
    const { login, password } = req.body;
  
    // Determine whether the login input is an email or username
    const isEmail = /\S+@\S+\.\S+/.test(login);
    const query = isEmail ? `SELECT * FROM users WHERE email = ?` : `SELECT * FROM users WHERE username = ?`;
  
    db.query(query, [login], (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }
  
      const user = results[0];
  
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
          return res.status(401).json({ error: 'Invalid username/email or password' });
        }
  
        // Generate a JWT token
        const token = jwt.sign({ userId: user.id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
  
        res.json({ message: 'Login successful', token, role: user.role }); // Include user role in response
      });
    });
  };
  