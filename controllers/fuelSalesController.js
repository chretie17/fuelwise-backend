const db = require('../db');

const moment = require('moment-timezone');


// Create a new fuel sale
exports.createFuelSale = (req, res) => {
  const { fuel_type, liters, sale_price_per_liter, sale_date, payment_mode } = req.body;
  const total_revenue = liters * sale_price_per_liter;

  // Use sale_date as-is, assuming it is already in 'YYYY-MM-DD' format
  const formattedSaleDate = sale_date;

  // Check inventory for the fuel type
  const checkInventoryQuery = `SELECT * FROM inventory WHERE fuel_type = ?`;
  db.query(checkInventoryQuery, [fuel_type], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching inventory details.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: `Fuel type '${fuel_type}' not found in inventory.` });
    }

    const availableLiters = parseFloat(results[0].liters);
    const inventoryId = results[0].id;

    if (parseFloat(liters) > availableLiters) {
      return res.status(400).json({
        error: `Not enough fuel in inventory for this sale. Available: ${availableLiters} liters, Requested: ${liters} liters.`,
      });
    }

    const updateInventoryQuery = `UPDATE inventory SET liters = liters - ? WHERE id = ?`;
    db.query(updateInventoryQuery, [liters, inventoryId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: 'Error updating inventory.' });
      }

      const insertSaleQuery = `INSERT INTO fuel_sales (fuel_type, liters, total_revenue, sale_price_per_liter, sale_date, payment_mode) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(insertSaleQuery, [fuel_type, liters, total_revenue, sale_price_per_liter, formattedSaleDate, payment_mode], (saleErr) => {
        if (saleErr) {
          return res.status(500).json({ error: 'Error recording fuel sale.' });
        }

        res.status(201).json({ message: 'Fuel sale recorded successfully' });
      });
    });
  });
};

// Update a fuel sale
exports.updateFuelSale = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, sale_price_per_liter, sale_date, payment_mode } = req.body;

  // Use sale_date as-is
  const formattedSaleDate = sale_date;
  const updateSaleQuery = `UPDATE fuel_sales SET fuel_type = ?, liters = ?, sale_price_per_liter = ?, sale_date = ?, payment_mode = ? WHERE id = ?`;

  db.query(updateSaleQuery, [fuel_type, liters, sale_price_per_liter, formattedSaleDate, payment_mode, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Fuel sale updated successfully' });
  });
};

// Get all fuel sales
exports.getAllFuelSales = (req, res) => {
  const query = `SELECT * FROM fuel_sales`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Format each sale date to the desired time zone (e.g., 'Africa/Kigali')
    const formattedResults = results.map((sale) => {
      return {
        ...sale,
        sale_date: moment.tz(sale.sale_date, 'Africa/Kigali').format('YYYY-MM-DD'), // Format date as 'YYYY-MM-DD'
      };
    });

    res.json(formattedResults);
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
