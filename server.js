const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});



// Route to Save User Information
app.post('/api/save', (req, res) => {
  const { UserId, name, email, phone, address, branch } = req.body;

  if (!UserId || !name || !email || !phone || !address || !branch) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  const id = uuidv4(); // Generate a unique ID for the record
  const query = `
    INSERT INTO users_ambuj (id, UserId, name, email, phone, address, branch) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.execute(query, [id, UserId, name, email, phone, address, branch], (err, results) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Failed to save user information' });
    }
    return res.status(200).json({ message: 'User information saved successfully!' });
  });
});

// Route to Fetch All Users
app.get('/api/info', (req, res) => {
  const query = 'SELECT * FROM users_ambuj';

  connection.execute(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    return res.json(results);
  });
});

// Route to Fetch User by ID or Name
app.get('/api/info/:identifier', (req, res) => {
  const { identifier } = req.params;
  const query = /^\d+$/.test(identifier)
    ? 'SELECT * FROM users_ambuj WHERE UserId = ?' 
    : 'SELECT * FROM users_ambuj WHERE name = ?';

  connection.execute(query, [identifier], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Failed to fetch user' });
    }

    if (results.length > 0) {
      return res.json(results);
    }
    return res.status(404).json({ message: 'User not found' });
  });
});

// Route to Delete User by UserId
app.delete('/api/delete/:userId', (req, res) => {
  const { userId } = req.params;

  const query = 'DELETE FROM users_ambuj WHERE UserId = ?';

  connection.execute(query, [userId], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    if (results.affectedRows > 0) {
      return res.status(200).json({ message: 'User deleted successfully!' });
    } else {
      return res.status(404).json({ message: 'User not found!' });
    }
  });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
