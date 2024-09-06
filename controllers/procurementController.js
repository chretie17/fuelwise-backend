const db = require('../db');

// Fetch the current procurement budget
exports.getBudget = (req, res) => {
  const fuelType = req.query.fuel_type; // Get fuel type from query parameters

  const query = 'SELECT budget FROM procurement_budget WHERE fuel_type = ? ORDER BY created_at DESC LIMIT 1';

  db.query(query, [fuelType], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching budget' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'No budget found for the specified fuel type' });
    }
    res.json({ budget: results[0].budget });
  });
};

// Set or update the procurement budget
exports.setBudget = (req, res) => {
  const { fuel_type, budget } = req.body;

  // Check if the user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Only admins can set the budget.' });
  }

  const query = 'INSERT INTO procurement_budget (fuel_type, budget) VALUES (?, ?)';

  db.query(query, [fuel_type, budget], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error setting budget' });
    }
    res.status(201).json({ message: 'Budget set successfully' });
  });
};
