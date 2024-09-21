const db = require('../db');

// Create a new BOQ item (Admin)
// Create a new BOQ item (Admin)// Create a new BOQ item (Admin)
exports.createBOQ = (req, res) => {
    const { fuel_type, description, quantity, estimated_price_per_unit, unit, deadline } = req.body;
    const query = `INSERT INTO boq (fuel_type, description, quantity, estimated_price_per_unit, unit, deadline) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.query(query, [fuel_type, description, quantity, estimated_price_per_unit, unit, deadline], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'BOQ item created successfully', boqId: result.insertId });
    });
  };
  
  

// Get all BOQ items
exports.getAllBOQItems = (req, res) => {
  const query = `SELECT * FROM boq`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a specific BOQ item by ID
exports.getBOQItemById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM boq WHERE id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'BOQ item not found' });
    }
    res.json(results[0]);
  });
};

// Update a BOQ item by ID (Admin)
exports.updateBOQItem = (req, res) => {
  const { id } = req.params;
  const { item_name, description, quantity, unit, deadline } = req.body;
  const query = `UPDATE boq SET fuel_type = ?, description = ?, quantity = ?, unit = ?, deadline = ? WHERE id = ?`;

  db.query(query, [item_name, description, quantity, unit, deadline, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'BOQ item updated successfully' });
  });
};

// Delete a BOQ item by ID (Admin)
exports.deleteBOQItem = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM boq WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'BOQ item deleted successfully' });
  });
};
