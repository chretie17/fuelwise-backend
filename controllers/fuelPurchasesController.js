const db = require('../db');

exports.createFuelPurchase = (req, res) => {
  const { fuel_type, liters, total_cost, supplier_id, purchase_date } = req.body;

  const insertPurchaseQuery = `INSERT INTO fuel_purchases (fuel_type, liters, total_cost, supplier_id, purchase_date) VALUES (?, ?, ?, ?, ?)`;
  db.query(insertPurchaseQuery, [fuel_type, liters, total_cost, supplier_id, purchase_date], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const checkInventoryQuery = `SELECT * FROM inventory WHERE fuel_type = ? AND supplier_id = ?`;
    db.query(checkInventoryQuery, [fuel_type, supplier_id], (inventoryErr, inventoryResults) => {
      if (inventoryErr) {
        return res.status(500).json({ error: inventoryErr.message });
      }

      if (inventoryResults.length > 0) {
        const updateInventoryQuery = `UPDATE inventory SET liters = liters + ?, unit_price = ? WHERE id = ?`;
        db.query(updateInventoryQuery, [liters, total_cost / liters, inventoryResults[0].id], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
          }
          res.status(201).json({ message: 'Fuel purchase recorded and inventory updated successfully' });
        });
      } else {
        const insertInventoryQuery = `INSERT INTO inventory (fuel_type, liters, unit_price, supplier_id, date_received) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertInventoryQuery, [fuel_type, liters, total_cost / liters, supplier_id, purchase_date], (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }
          res.status(201).json({ message: 'Fuel purchase recorded and new inventory added successfully' });
        });
      }
    });
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

// Update a fuel purchase
exports.updateFuelPurchase = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, total_cost, supplier_id, purchase_date } = req.body;

  const updatePurchaseQuery = `UPDATE fuel_purchases SET fuel_type = ?, liters = ?, total_cost = ?, supplier_id = ?, purchase_date = ? WHERE id = ?`;
  db.query(updatePurchaseQuery, [fuel_type, liters, total_cost, supplier_id, purchase_date, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Fuel purchase updated successfully' });
  });
};

// Delete a fuel purchase
exports.deleteFuelPurchase = (req, res) => {
  const { id } = req.params;
  const deletePurchaseQuery = `DELETE FROM fuel_purchases WHERE id = ?`;
  db.query(deletePurchaseQuery, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Fuel purchase deleted successfully' });
  });
};
