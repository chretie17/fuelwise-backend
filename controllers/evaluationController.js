const db = require('../db');
const nodemailer = require('nodemailer');

// Evaluate bids for a specific BOQ and select the best one
exports.evaluateBids = (req, res) => {
  const { boq_id } = req.params;

  // Step 1: Fetch BOQ details to get the estimated price for comparison
  const boqQuery = `SELECT estimated_price_per_unit FROM boq WHERE id = ?`;

  db.query(boqQuery, [boq_id], (err, boqResults) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error: Failed to fetch BOQ details.' });
    }

    if (boqResults.length === 0) {
      return res.status(404).json({ error: 'BOQ not found.' });
    }

    const estimatedPrice = boqResults[0].estimated_price_per_unit;

    // Step 2: Fetch all bids for this BOQ
    const bidQuery = `
      SELECT b.*, u.username AS supplier_name, u.id AS user_id
      FROM bids b
      JOIN users u ON b.user_id = u.id
      WHERE b.boq_id = ?
    `;

    db.query(bidQuery, [boq_id], (err, bidResults) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching bids.' });
      }

      if (bidResults.length === 0) {
        return res.status(404).json({ message: 'No bids found for this BOQ.' });
      }

      // Step 3: Evaluate the bids based on price, qualifications, and quality certificates
      let bestBid = null;
      bidResults.forEach(bid => {
        if (
          (bestBid === null || bid.bid_price_per_unit < bestBid.bid_price_per_unit) &&
          bid.qualifications &&
          bid.quality_certificates
        ) {
          bestBid = bid;
        }
      });

      if (!bestBid) {
        return res.status(404).json({ message: 'No suitable bid found based on evaluation criteria.' });
      }

      // Step 4: Respond with the best bid, including supplier_id (user_id)
      res.json({
        message: 'Best bid selected.',
        bestBid: {
          user_id: bestBid.user_id, // Include user_id (supplier_id) in the response
          supplier_name: bestBid.supplier_name,
          bid_price_per_unit: bestBid.bid_price_per_unit,
          total_price: bestBid.total_price,
          qualifications: bestBid.qualifications,
          quality_certificates: bestBid.quality_certificates,
          submission_date: bestBid.submission_date
        }
      });
    });
  });
};


// Set up email transport (use your SMTP settings)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Example: using Gmail
  auth: {
    user: 'turachretien@gmail.com',
    pass: 'ruix vmny qntx ywos',
  },
});


// Select a supplier for a specific BOQ and send an email
// Select a supplier for a specific BOQ and send an email
exports.selectSupplier = (req, res) => {
  const { boq_id, supplier_id } = req.body;

  // Log the supplier_id and boq_id to ensure they're correct
  console.log('Selecting Supplier with supplier_id:', supplier_id, 'for BOQ ID:', boq_id);

  if (!supplier_id || !boq_id) {
    console.error('Supplier ID or BOQ ID is missing.');
    return res.status(400).json({ error: 'Supplier ID or BOQ ID is missing.' });
  }

  // Get the bid and supplier details for the email
  const query = `
    SELECT b.*, u.email, u.username 
    FROM bids b 
    JOIN users u ON b.user_id = u.id
    WHERE b.user_id = ? AND b.boq_id = ?
  `;

  db.query(query, [supplier_id, boq_id], (err, results) => {
    if (err) {
      console.error('Error retrieving bid and supplier details:', err);
      return res.status(500).json({ error: 'Error retrieving bid and supplier details.' });
    }

    if (results.length === 0) {
      console.error('No bid found for this supplier and BOQ.');
      return res.status(400).json({ error: 'No bid found for this supplier and BOQ.' });
    }

    const bid = results[0];

    // Log the bid details
    console.log('Bid found:', bid);

    // Check if the supplier's email is available and proceed
    if (!bid.email) {
      console.error('Supplier email not found.');
      return res.status(400).json({ error: 'Supplier email not found.' });
    }

    // Send email to the selected supplier
    // Send email to the selected supplier
    const mailOptions = {
      from: 'FuelWise Procurement Team <your-email@gmail.com>',
      to: bid.email,
      subject: `Congratulations, ${bid.username}! You've Been Selected as a Supplier for BOQ ID ${boq_id}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Congratulations on Your Selection as a Supplier</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007547;
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .content {
                    padding: 30px;
                }
                .footer {
                    background-color: #007547;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    font-size: 12px;
                }
                h1, h2, h3 {
                    color: #007547;
                }
                .details {
                    background-color: #f9f9f9;
                    border-left: 4px solid #007547;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .button {
                    display: inline-block;
                    background-color: #007547;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-weight: bold;
                    transition: background-color 0.3s ease;
                }
                .button:hover {
                    background-color: #005a35;
                }
                ul {
                    padding-left: 20px;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://rubisrwanda.com/wp-content/uploads/2020/10/new-logo2.jpg" alt="FuelWise Logo" class="logo">
                    <h1>Congratulations, ${bid.username}!</h1>
                    <p>You've Been Selected as a Supplier</p>
                </div>
                <div class="content">
                    <p>Dear ${bid.username},</p>
                    <p>We are thrilled to inform you that your bid for <strong>BOQ ID ${boq_id}</strong> has been <strong>selected</strong> by our procurement team at FuelWise. Your expertise and competitive offer have set you apart in our selection process.</p>
                    
                    <h2>🏆 Winning Bid Details</h2>
                    <div class="details">
                        <p><strong>Fuel Type:</strong> [Fuel Type]</p>
                        <p><strong>Price per Unit:</strong> ${bid.bid_price_per_unit} RWF</p>
                        <p><strong>Total Price:</strong> ${bid.total_price} RWF</p>
                        <p><strong>Qualifications:</strong> ${bid.qualifications}</p>
                        <p><strong>Quality Certificates:</strong> ${bid.quality_certificates}</p>
                        <p><strong>Submission Date:</strong> ${new Date(bid.submission_date).toLocaleDateString()}</p>
                    </div>

                    <p>Your exceptional qualifications and certificates have impressed our team, and we are confident that this partnership will contribute significantly to our mission of delivering outstanding services to our customers.</p>

                    <h3>🚀 Next Steps</h3>
                    <p>Our procurement team will be in touch shortly with further details regarding:</p>
                    <ul>
                        <li>Finalizing the procurement process</li>
                        <li>Establishing delivery schedules</li>
                        <li>Completing any additional required documentation</li>
                        <li>Discussing potential long-term partnership opportunities</li>
                    </ul>

                    <p>We value your commitment to quality and look forward to a successful collaboration that will drive mutual growth and excellence in service delivery.</p>

                    <a href="mailto:procurement@fuelwise.com" class="button">Contact Procurement Team</a>

                    <p>Once again, congratulations on your selection. We are excited about the prospect of working together to fuel progress and innovation in our industry!</p>

                    <p>Best regards,<br><strong>The FuelWise Procurement Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                    <p>For inquiries, please contact us at <a href="mailto:support@fuelwise.com" style="color: white;">support@fuelwise.com</a></p>
                    <p>© 2024 FuelWise. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };


    transporter.sendMail(mailOptions, (emailErr, info) => {
      if (emailErr) {
        console.error('Error sending email to supplier:', emailErr);
        return res.status(500).json({ error: 'Error sending email to supplier.' });
      }

      // Return success message once email is sent
      res.json({ message: 'Supplier selected and email sent successfully.' });
    });
  });
};
