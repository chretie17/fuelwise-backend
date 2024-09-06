// controllers/bidsController.js
const db = require('../db');
const nodemailer = require('nodemailer'); // Import nodemailer for sending email notifications

// Supplier submits a bid
// Supplier submits a bid
exports.submitBid = (req, res) => {
    const userId = req.user.userId; // Assuming JWT middleware has set req.user
    const { fuel_type, price_per_liter, boq_details, qualifications, quality_certificates } = req.body;
  
    // Check if the supplier exists for the logged-in user
    const checkSupplierQuery = `SELECT id FROM suppliers WHERE user_id = ?`;
  
    db.query(checkSupplierQuery, [userId], (checkErr, supplierResults) => {
      if (checkErr) {
        return res.status(500).json({ error: 'Error checking supplier for the logged-in user' });
      }
  
      if (supplierResults.length === 0) {
        return res.status(404).json({ error: 'No supplier found for the logged-in user' });
      }
  
      const supplier_id = supplierResults[0].id; // Get the supplier ID
  
      // Proceed to insert the bid since the supplier exists
      const insertBidQuery = `
        INSERT INTO bids (supplier_id, fuel_type, price_per_liter, boq_details, qualifications, quality_certificates, submission_date) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
  
      db.query(insertBidQuery, [supplier_id, fuel_type, price_per_liter, boq_details, qualifications, quality_certificates], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Bid submitted successfully', bidId: result.insertId });
      });
    });
  };
  // Evaluate bids and select the best supplier
  exports.evaluateBids = (req, res) => {
    const { fuel_type, budget, required_qualifications, required_quality_certificates } = req.body;
  
    // Query to fetch all bids for the specific fuel type
    const query = `
      SELECT b.id, b.supplier_id, b.price_per_liter, b.boq_details, b.qualifications, b.quality_certificates, 
             s.name as supplier_name, s.email as supplier_email 
      FROM bids b 
      JOIN suppliers s ON b.supplier_id = s.id 
      WHERE b.fuel_type = ? 
      ORDER BY b.price_per_liter ASC
    `;
  
    db.query(query, [fuel_type], (err, bids) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      if (bids.length === 0) {
        return res.status(404).json({ message: 'No bids found for the selected fuel type' });
      }
  
      // Filter bids based on budget, qualifications, and quality
      const qualifiedBids = bids.filter((bid) => {
        const meetsBudget = parseFloat(bid.price_per_liter) <= parseFloat(budget);
        const hasQualifications = required_qualifications.every((reqQual) => 
          bid.qualifications.includes(reqQual)
        );
        const meetsQuality = required_quality_certificates.every((reqCert) => 
          bid.quality_certificates.includes(reqCert)
        );
  
        return meetsBudget && hasQualifications && meetsQuality;
      });
  
      if (qualifiedBids.length === 0) {
        return res.status(404).json({ message: 'No qualified bids found that meet the budget and criteria' });
      }
  
      const selectedBid = qualifiedBids[0];
  
      // Send email notification to the selected supplier
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'turachretien@gmail.com', 
          pass: 'ruix vmny qntx ywos', 
        },
      });
  
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: selectedBid.supplier_email,
        subject: 'You Have Been Selected as the Supplier',
        text: `Congratulations! Your bid has been selected to supply ${fuel_type}. Please contact us for further details.`,
      };
  
      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error('Error sending email:', mailErr.message);
        } else {
          console.log('Selection email sent:', info.response);
        }
      });
  
      // Return selected supplier details along with a success message
      res.json({ 
        message: 'Supplier selected successfully',
        selectedSupplier: {
          name: selectedBid.supplier_name,
          email: selectedBid.supplier_email,
          pricePerLiter: selectedBid.price_per_liter,
          boqDetails: selectedBid.boq_details,
          qualifications: selectedBid.qualifications,
          qualityCertificates: selectedBid.quality_certificates,
        }
      });
    });
  };
  
// Get all bids for a specific fuel type
exports.getAllBidsByFuelType = (req, res) => {
  const { fuel_type } = req.params;

  const query = `
    SELECT b.id, b.supplier_id, b.price_per_liter, b.boq_details, b.qualifications, b.quality_certificates, 
           b.submission_date, s.name as supplier_name 
    FROM bids b 
    JOIN suppliers s ON b.supplier_id = s.id 
    WHERE b.fuel_type = ? 
    ORDER BY b.submission_date DESC
  `;

  db.query(query, [fuel_type], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Delete a bid by ID
exports.deleteBid = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM bids WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Bid deleted successfully' });
  });
};
