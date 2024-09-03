// controllers/fuelSalesController.js
const db = require('../db');

// Create a new fuel sale
exports.createFuelSale = (req, res) => {
  const { fuel_type, liters, sale_price_per_liter, sale_date } = req.body;
  const total_revenue = liters * sale_price_per_liter;

  const checkInventoryQuery = `SELECT * FROM inventory WHERE fuel_type = ?`;
  db.query(checkInventoryQuery, [fuel_type], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0 || results[0].liters < liters) {
      return res.status(400).json({ error: 'Not enough fuel in inventory for this sale' });
    }

    const availableLiters = results[0].liters;
    const inventoryId = results[0].id;
    const supplierId = results[0].supplier_id;
    const unitPrice = results[0].unit_price;

    const updateInventoryQuery = `UPDATE inventory SET liters = liters - ? WHERE id = ?`;
    db.query(updateInventoryQuery, [liters, inventoryId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }

      const insertSaleQuery = `INSERT INTO fuel_sales (fuel_type, liters, total_revenue, sale_price_per_liter, sale_date) VALUES (?, ?, ?, ?, ?)`;
      db.query(insertSaleQuery, [fuel_type, liters, total_revenue, sale_price_per_liter, sale_date], (saleErr) => {
        if (saleErr) {
          return res.status(500).json({ error: saleErr.message });
        }

        if (availableLiters - liters < 50) {
          const reorderLiters = 500;
          const reorderCost = reorderLiters * unitPrice;

          const reorderQuery = `INSERT INTO fuel_purchases (fuel_type, liters, total_cost, supplier_id, purchase_date) VALUES (?, ?, ?, ?, NOW())`;
          db.query(reorderQuery, [fuel_type, reorderLiters, reorderCost, supplierId], (reorderErr) => {
            if (reorderErr) {
              console.error('Error reordering fuel:', reorderErr.message);
            } else {
              const updateInventoryAfterReorderQuery = `UPDATE inventory SET liters = liters + ? WHERE id = ?`;
              db.query(updateInventoryAfterReorderQuery, [reorderLiters, inventoryId], (updateReorderErr) => {
                if (updateReorderErr) {
                  console.error('Error updating inventory after reorder:', updateReorderErr.message);
                }
              });
            }
          });
        }

        res.status(201).json({ message: 'Fuel sale recorded successfully' });
      });
    });
  });
};

// Get all fuel sales
exports.getAllFuelSales = (req, res) => {
  const query = `SELECT * FROM fuel_sales`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Update a fuel sale
exports.updateFuelSale = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, sale_price_per_liter, sale_date } = req.body;

  const updateSaleQuery = `UPDATE fuel_sales SET fuel_type = ?, liters = ?, sale_price_per_liter = ?, sale_date = ? WHERE id = ?`;
  db.query(updateSaleQuery, [fuel_type, liters, sale_price_per_liter, sale_date, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Fuel sale updated successfully' });
  });
};

// Delete a fuel sale
exports.deleteFuelSale = (req, res) => {
  const { id } = req.params;
  const deleteSaleQuery = `DELETE FROM fuel_sales WHERE id = ?`;
  db.query(deleteSaleQuery, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Fuel sale deleted successfully' });
  });
};
