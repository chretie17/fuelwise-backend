// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user (Admin only)
exports.registerUser = (req, res) => {
  

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
  
        const token = jwt.sign({ userId: user.id, role: user.role }, '563f9b4f5b4c7d356ad3865ad60b67be44e42066739d75ce8022afc5a54ce5fa', { expiresIn: '24h' });
  
        res.json({ message: 'Login successful', token, role: user.role, userId: user.id }); 
      });
    });
  };
  