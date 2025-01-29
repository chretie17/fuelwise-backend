const db = require('../db');

// Create a new fuel purchase and update inventory for the branch
exports.createFuelPurchase = (req, res) => {
  const { fuel_type, liters, total_cost, purchase_date } = req.body;
  const branch_id = req.body.branch_id || req.user.branch_id;  // Use branch_id from request or logged-in user

  // Insert the new fuel purchase
  const insertPurchaseQuery = `INSERT INTO fuel_purchases (fuel_type, liters, total_cost, purchase_date, branch_id) 
                               VALUES (?, ?, ?, ?, ?)`;
  db.query(insertPurchaseQuery, [fuel_type, liters, total_cost, purchase_date, branch_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if the fuel type already exists in inventory for the same branch
    const checkInventoryQuery = `SELECT * FROM inventory WHERE fuel_type = ? AND branch_id = ?`;
    db.query(checkInventoryQuery, [fuel_type, branch_id], (inventoryErr, inventoryResults) => {
      if (inventoryErr) {
        return res.status(500).json({ error: inventoryErr.message });
      }

      // If fuel type exists, update the inventory
      if (inventoryResults.length > 0) {
        const updateInventoryQuery = `UPDATE inventory SET liters = liters + ?, unit_price = ? WHERE id = ?`;
        db.query(updateInventoryQuery, [liters, total_cost / liters, inventoryResults[0].id], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
          }
          res.status(201).json({ message: 'Fuel purchase recorded and inventory updated successfully' });
        });
      } else {
        // If fuel type does not exist, insert a new inventory record for the branch
        const insertInventoryQuery = `INSERT INTO inventory (fuel_type, liters, unit_price, branch_id, date_received) 
                                      VALUES (?, ?, ?, ?, ?)`;
        db.query(insertInventoryQuery, [fuel_type, liters, total_cost / liters, branch_id, purchase_date], (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }
          res.status(201).json({ message: 'Fuel purchase recorded and new inventory added successfully' });
        });
      }
    });
  });
};

// Get all fuel purchases by branch
exports.getAllFuelPurchases = (req, res) => {
  const branch_id = req.query.branch_id || req.user.branch_id;  // Use branch_id from query or logged-in user
  const query = `SELECT * FROM fuel_purchases WHERE branch_id = ?`;
  
  db.query(query, [branch_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Update a fuel purchase and update the branch's inventory
exports.updateFuelPurchase = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, total_cost, purchase_date } = req.body;
  const branch_id = req.body.branch_id || req.user.branch_id;

  const updatePurchaseQuery = `UPDATE fuel_purchases SET fuel_type = ?, liters = ?, total_cost = ?, purchase_date = ?, branch_id = ? WHERE id = ?`;
  db.query(updatePurchaseQuery, [fuel_type, liters, total_cost, purchase_date, branch_id, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Fuel purchase updated successfully' });

    // Update inventory for the branch
    const checkInventoryQuery = `SELECT * FROM inventory WHERE fuel_type = ? AND branch_id = ?`;
    db.query(checkInventoryQuery, [fuel_type, branch_id], (inventoryErr, inventoryResults) => {
      if (inventoryErr) {
        return res.status(500).json({ error: inventoryErr.message });
      }

      // Update existing inventory or create a new record
      if (inventoryResults.length > 0) {
        const updateInventoryQuery = `UPDATE inventory SET liters = liters + ?, unit_price = ? WHERE id = ?`;
        db.query(updateInventoryQuery, [liters, total_cost / liters, inventoryResults[0].id], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
          }
        });
      } else {
        const insertInventoryQuery = `INSERT INTO inventory (fuel_type, liters, unit_price, branch_id, date_received) 
                                      VALUES (?, ?, ?, ?, ?)`;
        db.query(insertInventoryQuery, [fuel_type, liters, total_cost / liters, branch_id, purchase_date], (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: insertErr.message });
          }
        });
      }
    });
  });
};

// Delete a fuel purchase and adjust inventory for the branch
exports.deleteFuelPurchase = (req, res) => {
  const { id } = req.params;

  // Fetch the purchase to get the liters and fuel_type for inventory adjustment
  const selectPurchaseQuery = `SELECT * FROM fuel_purchases WHERE id = ?`;
  db.query(selectPurchaseQuery, [id], (err, purchaseResults) => {
    if (err || purchaseResults.length === 0) {
      return res.status(500).json({ error: 'Error fetching purchase details or purchase not found.' });
    }

    const { fuel_type, liters, branch_id } = purchaseResults[0];

    // Delete the purchase
    const deletePurchaseQuery = `DELETE FROM fuel_purchases WHERE id = ?`;
    db.query(deletePurchaseQuery, [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: deleteErr.message });
      }

      // Adjust inventory for the branch by subtracting the liters
      const updateInventoryQuery = `UPDATE inventory SET liters = liters - ? WHERE fuel_type = ? AND branch_id = ?`;
      db.query(updateInventoryQuery, [liters, fuel_type, branch_id], (inventoryErr) => {
        if (inventoryErr) {
          return res.status(500).json({ error: 'Error updating inventory.' });
        }
        res.json({ message: 'Fuel purchase deleted and inventory adjusted successfully' });
      });
    });
  });
};
exports.getAllFuelPurchasesWithBranch = (req, res) => {
  const query = `
    SELECT fp.id, fp.fuel_type, fp.liters, fp.total_cost, fp.purchase_date, b.name AS branch_name
    FROM fuel_purchases fp
    LEFT JOIN branches b ON fp.branch_id = b.id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching fuel purchases.' });
    }
    res.json(results);
  });
};

// Get all fuel purchases with branch names (Admin view)
exports.getAllFuelPurchasesForAdmin = (req, res) => {
  const query = `
    SELECT fp.id, fp.fuel_type, fp.liters, fp.total_cost, fp.purchase_date, 
           b.name AS branch_name, fp.branch_id
    FROM fuel_purchases fp
    LEFT JOIN branches b ON fp.branch_id = b.id
    ORDER BY fp.purchase_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching fuel purchases for admin.' });
    }

    res.json(results);
  });
};
