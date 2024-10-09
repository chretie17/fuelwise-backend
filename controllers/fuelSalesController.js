const db = require('../db');
const moment = require('moment-timezone');

// Create a new fuel sale
exports.createFuelSale = (req, res) => {
  const { fuel_type, liters, sale_price_per_liter, sale_date, payment_mode, branch_id } = req.body;
  const total_revenue = liters * sale_price_per_liter;

  // Use sale_date as-is, assuming it is already in 'YYYY-MM-DD' format
  const formattedSaleDate = sale_date;

  // Check inventory for the fuel type in the specific branch
  const checkInventoryQuery = `SELECT * FROM inventory WHERE fuel_type = ? AND branch_id = ?`;
  db.query(checkInventoryQuery, [fuel_type, branch_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching inventory details.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: `Fuel type '${fuel_type}' not found in inventory for the specified branch.` });
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

      const insertSaleQuery = `INSERT INTO fuel_sales (fuel_type, liters, total_revenue, sale_price_per_liter, sale_date, payment_mode, branch_id) 
                               VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(insertSaleQuery, [fuel_type, liters, total_revenue, sale_price_per_liter, formattedSaleDate, payment_mode, branch_id], (saleErr) => {
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
  const { fuel_type, liters, sale_price_per_liter, sale_date, payment_mode, branch_id } = req.body;

  // Use sale_date as-is
  const formattedSaleDate = sale_date;
  const updateSaleQuery = `UPDATE fuel_sales SET fuel_type = ?, liters = ?, sale_price_per_liter = ?, sale_date = ?, payment_mode = ?, branch_id = ? WHERE id = ?`;

  db.query(updateSaleQuery, [fuel_type, liters, sale_price_per_liter, formattedSaleDate, payment_mode, branch_id, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Fuel sale updated successfully' });
  });
};

// Get all fuel sales by branch (for branch-specific reports)
exports.getAllFuelSales = (req, res) => {
  const { branch_id } = req.query; // Optional branch_id query parameter to filter by branch
  let query = `SELECT * FROM fuel_sales`;
  let params = [];

  if (branch_id) {
    query += ` WHERE branch_id = ?`;
    params.push(branch_id);
  }

  db.query(query, params, (err, results) => {
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
// Controller function to get sales by branch
exports.getSalesByBranch = (req, res) => {
  const { branch_id } = req.params;
  const query = `SELECT * FROM fuel_sales WHERE branch_id = ?`;
  db.query(query, [branch_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching sales data.' });
    }
    res.json(results);
  });
};
exports.getAllFuelSalesWithBranch = (req, res) => {
  const query = `
    SELECT fs.id, fs.fuel_type, fs.liters, fs.sale_price_per_liter, fs.sale_date, fs.payment_mode, b.name AS branch_name
    FROM fuel_sales fs
    LEFT JOIN branches b ON fs.branch_id = b.id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching fuel sales.' });
    }
    res.json(results);
  });
};