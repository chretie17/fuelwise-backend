const db = require('../db');
const moment = require('moment');

// Generate report data for all branches with an optional date range
exports.getBranchReport = (req, res) => {
  const { start_date, end_date } = req.query;  // Optional date range

  const query = `
    SELECT
      b.name AS branch_name,
      COALESCE(SUM(fp.liters), 0) AS total_liters_purchased,
      COALESCE(SUM(fs.liters), 0) AS total_liters_sold,
      COALESCE(SUM(i.liters), 0) AS remaining_inventory
    FROM
      branches b
    LEFT JOIN
      fuel_purchases fp ON b.id = fp.branch_id
    LEFT JOIN
      fuel_sales fs ON b.id = fs.branch_id
    LEFT JOIN
      inventory i ON b.id = i.branch_id
    WHERE
      (fp.purchase_date BETWEEN ? AND ? OR fs.sale_date BETWEEN ? AND ?)
    GROUP BY
      b.name;
  `;

  // Default to the current year if the date range is not provided
  const startDate = start_date || '2024-01-01';
  const endDate = end_date || moment().format('YYYY-MM-DD');

  db.query(query, [startDate, endDate, startDate, endDate], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);  // Return the result as JSON for frontend usage
  });
};

// Generate summary of total revenue per branch
exports.getBranchRevenueReport = (req, res) => {
  const { start_date, end_date } = req.query;

  const query = `
    SELECT
      b.name AS branch_name,
      SUM(fs.total_revenue) AS total_revenue
    FROM
      fuel_sales fs
    JOIN
      branches b ON fs.branch_id = b.id
    WHERE
      fs.sale_date BETWEEN ? AND ?
    GROUP BY
      b.name
    ORDER BY
      total_revenue DESC;
  `;

  const startDate = start_date || '2024-01-01';
  const endDate = end_date || moment().format('YYYY-MM-DD');

  db.query(query, [startDate, endDate], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Generate a monthly sales report for each branch
exports.getMonthlySalesReport = (req, res) => {
  const { year } = req.query;

  const query = `
    SELECT
      b.name AS branch_name,
      MONTH(fs.sale_date) AS month,
      SUM(fs.liters) AS total_liters_sold,
      SUM(fs.total_revenue) AS total_revenue
    FROM
      fuel_sales fs
    JOIN
      branches b ON fs.branch_id = b.id
    WHERE
      YEAR(fs.sale_date) = ?
    GROUP BY
      b.name, MONTH(fs.sale_date)
    ORDER BY
      month ASC;
  `;

  const reportYear = year || moment().format('YYYY');

  db.query(query, [reportYear], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get remaining fuel inventory report per branch
exports.getInventoryReport = (req, res) => {
  const query = `
    SELECT
      b.name AS branch_name,
      i.fuel_type,
      i.liters AS available_liters
    FROM
      inventory i
    JOIN
      branches b ON i.branch_id = b.id
    ORDER BY
      b.name, i.fuel_type;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
exports.getReport = (req, res) => {
    const { reportType } = req.params;
    const { start_date, end_date } = req.query;
  
    // Different SQL queries for different types of reports
    let query = '';
    const params = [];
  
    // Build query for overall report or date range report based on reportType
    switch (reportType) {
      case 'branch-report':
        query = `
          SELECT b.name AS branch_name, 
                 COALESCE(SUM(fp.liters), 0) AS total_liters_purchased, 
                 COALESCE(SUM(fs.liters), 0) AS total_liters_sold, 
                 COALESCE(SUM(i.liters), 0) AS remaining_inventory
          FROM branches b
          LEFT JOIN fuel_purchases fp ON b.id = fp.branch_id
          LEFT JOIN fuel_sales fs ON b.id = fs.branch_id
          LEFT JOIN inventory i ON b.id = i.branch_id
          `;
        if (start_date && end_date) {
          query += `WHERE fp.purchase_date BETWEEN ? AND ? OR fs.sale_date BETWEEN ? AND ? `;
          params.push(start_date, end_date, start_date, end_date);
        }
        query += `GROUP BY b.name`;
        break;
  
      case 'branch-revenue':
        query = `
          SELECT b.name AS branch_name, 
                 SUM(fs.total_revenue) AS total_revenue 
          FROM fuel_sales fs 
          JOIN branches b ON fs.branch_id = b.id
          `;
        if (start_date && end_date) {
          query += `WHERE fs.sale_date BETWEEN ? AND ? `;
          params.push(start_date, end_date);
        }
        query += `GROUP BY b.name ORDER BY total_revenue DESC`;
        break;
  
      case 'monthly-sales':
        query = `
          SELECT b.name AS branch_name, 
                 MONTH(fs.sale_date) AS month, 
                 SUM(fs.liters) AS total_liters_sold, 
                 SUM(fs.total_revenue) AS total_revenue 
          FROM fuel_sales fs 
          JOIN branches b ON fs.branch_id = b.id
          `;
        if (start_date && end_date) {
          query += `WHERE fs.sale_date BETWEEN ? AND ? `;
          params.push(start_date, end_date);
        }
        query += `GROUP BY b.name, MONTH(fs.sale_date) ORDER BY month ASC`;
        break;
  
      case 'inventory-report':
        query = `
          SELECT b.name AS branch_name, 
                 i.fuel_type, 
                 i.liters AS available_liters 
          FROM inventory i 
          JOIN branches b ON i.branch_id = b.id 
          `;
        if (start_date && end_date) {
          // No date filtering for inventory report, just fetch available inventory
          query += `ORDER BY b.name, i.fuel_type`;
        }
        break;
  
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }
  
    db.query(query, params, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching report data.' });
      }
      res.json(results);
    });
  };