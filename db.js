// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',       // Replace with your database host
  user: 'root',            // Replace with your database username
  password: 'Admin@123', // Replace with your database password
  database: 'fuelwise'  // Replace with your database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database.');
});

module.exports = connection;
