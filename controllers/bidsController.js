const db = require('../db');

exports.submitBid = (req, res) => {
  const { user_id, boq_id, bid_price_per_unit, qualifications, quality_certificates } = req.body;

  // Check if the user has already submitted a bid for the same BOQ
  const checkDuplicateBidQuery = `SELECT * FROM bids WHERE user_id = ? AND boq_id = ?`;

  db.query(checkDuplicateBidQuery, [user_id, boq_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking for duplicate bid.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'You have already submitted a bid for this BOQ.' });
    }

    // Fetch the quantity from the BOQ table
    const boqQuery = `SELECT quantity FROM boq WHERE id = ?`;

    db.query(boqQuery, [boq_id], (err, boqResults) => {
      if (err || boqResults.length === 0) {
        return res.status(400).json({ error: 'Invalid BOQ.' });
      }

      const quantity = boqResults[0].quantity;
      const total_price = bid_price_per_unit * quantity;

      // Insert the new bid into the bids table
      const insertBidQuery = `
        INSERT INTO bids (user_id, boq_id, bid_price_per_unit, total_price, qualifications, quality_certificates) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(insertBidQuery, [user_id, boq_id, bid_price_per_unit, total_price, qualifications, quality_certificates], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Bid submitted successfully', bidId: result.insertId });
      });
    });
  });
};

exports.getBidsByBOQ = (req, res) => {
  const { boq_id } = req.params;
  const query = `
    SELECT b.*, u.username AS supplier_name 
    FROM bids b 
    JOIN users u ON b.user_id = u.id
    WHERE b.boq_id = ?
  `;

  db.query(query, [boq_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get all bids
// Get all bids
exports.getAllBids = (req, res) => {
  const query = `
    SELECT 
      bids.id, 
      bids.bid_price_per_unit, 
      bids.total_price, 
      bids.qualifications, 
      bids.quality_certificates, 
      bids.submission_date,
      boq.fuel_type, 
      boq.description,
      users.username AS supplier_name 
    FROM bids 
    JOIN boq ON bids.boq_id = boq.id
    JOIN users ON bids.user_id = users.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
