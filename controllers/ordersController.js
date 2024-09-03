// controllers/orderController.js
const db = require('../db');
const nodemailer = require('nodemailer');

// Create a new order (manually or automatically)
exports.createOrder = (req, res) => {
  const { fuel_type, liters, supplier_id, order_date, created_by } = req.body; // `created_by` will indicate whether the order was manual or automatic

  const insertOrderQuery = `INSERT INTO orders (fuel_type, liters, supplier_id, order_date, created_by) VALUES (?, ?, ?, ?, ?)`;
  db.query(insertOrderQuery, [fuel_type, liters, supplier_id, order_date, created_by], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Send an email to the supplier after creating an order
    const supplierQuery = `SELECT email FROM suppliers WHERE id = ?`;
    db.query(supplierQuery, [supplier_id], (emailErr, emailResult) => {
      if (emailErr || emailResult.length === 0) {
        return res.status(500).json({ error: 'Supplier not found or email error' });
      }
      const supplierEmail = emailResult[0].email;

      // Setup email transport configuration
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'your-email@gmail.com', // Replace with your email
          pass: 'your-password', // Replace with your email password or app-specific password
        },
      });

      const mailOptions = {
        from: 'your-email@gmail.com',
        to: supplierEmail,
        subject: 'New Fuel Order',
        text: `A new order has been placed for ${liters} liters of ${fuel_type}. Please process this order.`,
      };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error('Error sending email:', mailErr.message);
        } else {
          console.log('Order email sent:', info.response);
        }
      });
    });

    res.status(201).json({ message: 'Order created successfully' });
  });
};

// Get all orders
exports.getAllOrders = (req, res) => {
  const query = `SELECT o.id, o.fuel_type, o.liters, s.name as supplier_name, o.order_date, o.created_by FROM orders o 
                 LEFT JOIN suppliers s ON o.supplier_id = s.id`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Update an order
exports.updateOrder = (req, res) => {
  const { id } = req.params;
  const { fuel_type, liters, supplier_id, order_date } = req.body;

  const updateOrderQuery = `UPDATE orders SET fuel_type = ?, liters = ?, supplier_id = ?, order_date = ? WHERE id = ?`;
  db.query(updateOrderQuery, [fuel_type, liters, supplier_id, order_date, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Order updated successfully' });
  });
};

// Delete an order
exports.deleteOrder = (req, res) => {
  const { id } = req.params;
  const deleteOrderQuery = `DELETE FROM orders WHERE id = ?`;
  db.query(deleteOrderQuery, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Order deleted successfully' });
  });
};
