const db = require('../db');

const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider
  auth: {
    user: 'turachretien@gmail.com', 
    pass: 'ruix vmny qntx ywos', 
  },
});

// Configuration
const emailRecipient = 'peacenam09@gmail.com';
const inventoryThreshold = 50;
const companyLogo = 'https://rubisrwanda.com/wp-content/uploads/2020/10/new-logo2.jpg'; // Add your company logo URL here

// Function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Function to get severity class based on inventory level
const getSeverityClass = (liters) => {
  if (liters < 20) return 'critical';
  if (liters < 35) return 'warning';
  return 'moderate';
};

// Function to check inventory levels and send notifications
exports.checkLowInventory = () => {
  const query = `
    SELECT 
      i.id, 
      i.fuel_type, 
      i.liters, 
      b.name AS branch_name,
      i.last_updated
    FROM inventory i
    LEFT JOIN branches b ON i.branch_id = b.id
    WHERE i.liters < ?
    ORDER BY i.liters ASC
  `;

  db.query(query, [inventoryThreshold], (err, results) => {
    if (err) {
      console.error('Error checking inventory levels:', err.message);
      return;
    }

    if (results.length > 0) {
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const lowInventoryItems = results
        .map(item => {
          const severityClass = getSeverityClass(item.liters);
          const lastUpdated = new Date(item.last_updated).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return `
            <tr class="${severityClass}">
              <td style="padding: 12px; border: 1px solid #ddd;">${item.fuel_type}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">
                <div class="inventory-level ${severityClass}">
                  ${formatNumber(item.liters)} liters
                </div>
              </td>
              <td style="padding: 12px; border: 1px solid #ddd;">${item.branch_name}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${lastUpdated}</td>
            </tr>
          `;
        })
        .join('');

      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .inventory-level {
              padding: 6px 12px;
              border-radius: 4px;
              display: inline-block;
              font-weight: 500;
            }
            .critical {
              background-color: #ffe5e5;
              color: #d63031;
            }
            .warning {
              background-color: #fff3cd;
              color: #856404;
            }
            .moderate {
              background-color: #e8f5e9;
              color: #1b5e20;
            }
            .summary-box {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              border-left: 4px solid #2e8b57;
            }
          </style>
        </head>
        <body>
          <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${companyLogo}" alt="Company Logo" style="max-height: 60px; margin-bottom: 20px;">
              <h1 style="color: #2e8b57; font-size: 28px; margin: 0;">Low Inventory Alert</h1>
              <p style="color: #666; font-size: 16px;">${currentDate}</p>
            </div>

            <div class="summary-box">
              <h3 style="color: #2e8b57; margin-top: 0;">Inventory Summary</h3>
              <p style="margin: 0;">
                <strong>${results.length}</strong> items are below the threshold of 
                <strong>${inventoryThreshold}</strong> liters
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background-color: #2e8b57;">
                  <th style="padding: 15px; color: white; text-align: left;">Fuel Type</th>
                  <th style="padding: 15px; color: white; text-align: left;">Remaining</th>
                  <th style="padding: 15px; color: white; text-align: left;">Branch</th>
                  <th style="padding: 15px; color: white; text-align: left;">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                ${lowInventoryItems}
              </tbody>
            </table>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-top: 30px;">
              <h3 style="color: #2e8b57; margin-top: 0;">Action Required</h3>
              <p style="margin: 0; line-height: 1.6;">
                Please review these inventory levels and take necessary action to restock. 
                Priority should be given to items marked in red (critical) and yellow (warning).
              </p>
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p style="font-size: 14px; margin: 0;">This is an automated notification from your Inventory Management System</p>
              <p style="font-size: 12px; margin-top: 10px;">
                For support, contact IT department at info@fuelwise.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: {
          name: 'Inventory Management System',
          address: 'your-email@gmail.com'
        },
        to: emailRecipient,
        subject: `🚨 Low Inventory Alert - ${results.length} Items Need Attention`,
        html: emailContent,
        priority: 'high'
      };

      transporter.sendMail(mailOptions, (emailErr, info) => {
        if (emailErr) {
          console.error('Error sending email:', emailErr.message);
        } else {
          console.log('Low inventory notification sent:', info.response);
        }
      });
    } else {
      console.log('No low inventory items detected.');
    }
  });
};

const cron = require('node-cron');

cron.schedule('*/5 * * * *', () => {
  console.log('Running low inventory check...');
  exports.checkLowInventory();
});

exports.createInventoryItem = (req, res) => {
  const { fuel_type, liters, unit_price, date_received, branch_id } = req.body;
  const query = `INSERT INTO inventory (fuel_type, liters, unit_price, date_received, branch_id) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [fuel_type, liters, unit_price, date_received, branch_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Inventory item created successfully', inventoryId: result.insertId });
  });
};


// Get inventory items by branch
exports.getInventoryItemsByBranch = (req, res) => {
  const { branch_id } = req.params; // branch_id will be passed as a route parameter
  const query = `SELECT i.id, i.fuel_type, i.liters, i.unit_price, s.name as supplier_name, b.name as branch_name, i.date_received, i.date_updated 
                 FROM inventory i 
                 LEFT JOIN suppliers s ON i.supplier_id = s.id 
                 LEFT JOIN branches b ON i.branch_id = b.id
                 WHERE i.branch_id = ?`; // Only fetch inventory for the specified branch
  db.query(query, [branch_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedResults = formatDatesInResult(results); // Format dates
    res.json(formattedResults);
  });
};

// Helper function to format dates
const formatDatesInResult = (results) => {
  return results.map(item => {
    item.date_received = new Date(item.date_received).toISOString().split('T')[0]; // Ensure date is in YYYY-MM-DD format
    if (item.date_updated) {
      item.date_updated = new Date(item.date_updated).toISOString().split('T')[0];
    }
    return item;
  });
};

// Get all branches
exports.getAllBranches = (req, res) => {
  const query = `SELECT * FROM branches`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // Return all branches
  });
};

// Get all inventory items
exports.getAllInventoryItems = (req, res) => {
  const query = `SELECT i.id, i.fuel_type, i.liters, i.unit_price, s.name as supplier_name, i.date_received, i.date_updated 
                 FROM inventory i 
                 LEFT JOIN suppliers s ON i.supplier_id = s.id`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedResults = formatDatesInResult(results); // Format dates
    res.json(formattedResults);
  });
};

// Get a specific inventory item by ID
exports.getInventoryItemById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM inventory WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    const formattedResults = formatDatesInResult(results); // Format dates
    res.json(formattedResults[0]);
  });
};

// Update an inventory item by ID
exports.updateInventoryItem = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, unit_price, date_received, branch_id } = req.body;
  const query = `UPDATE inventory SET fuel_type = ?, liters = ?, unit_price = ?, date_received = ?, branch_id = ? WHERE id = ?`;
  db.query(query, [fuel_type, liters, unit_price, date_received, branch_id, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Inventory item updated successfully' });
  });
};

// Delete an inventory item by ID
exports.deleteInventoryItem = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM inventory WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  });
};

// Create a new fuel purchase
exports.createFuelPurchase = (req, res) => {
  const { fuel_type, liters, total_cost, supplier_id, purchase_date } = req.body;
  const query = `INSERT INTO fuel_purchases (fuel_type, liters, total_cost, supplier_id, purchase_date) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [fuel_type, liters, total_cost, supplier_id, purchase_date], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Fuel purchase recorded successfully', purchaseId: result.insertId });
  });
};

// Helper function to format dates for fuel purchases
const formatFuelPurchaseDates = (results) => {
  return results.map(item => {
    item.purchase_date = new Date(item.purchase_date).toISOString().split('T')[0]; // Ensure proper date formatting (YYYY-MM-DD)
    return item;
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
    const formattedResults = formatFuelPurchaseDates(results); // Format dates
    res.json(formattedResults);
  });
};
