const express = require('express');
const path = require('path');
const mysql = require('mysql2');  // Use mysql2 (modern, promise support)
const app = express();
const PORT = 3000;

// MySQL Connection Pool (better for production)
const db = mysql.createPool({
  host: 'localhost',
  user: 'cotel_app',           // Your MySQL username
  password: 'Cotel2025$', // Your MySQL password
  database: 'money_transfer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL Error:', err);
    return;
  }
  connection.release();
  console.log('✅ MySQL Connected!');
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// 1. ROOT - Login Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 2. LOGIN - Check user in MySQL
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?', 
    [username, password],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Server error');
      }
      
      if (results.length > 0) {
        console.log('✅ Login successful:', username);
        res.redirect('/selection.html');
      } else {
        console.log('❌ Login failed:', username);
        res.status(401).send(`
          <h2 style="color:red;text-align:center;">❌ Invalid credentials!</h2>
          <p style="text-align:center;"><a href="/">Try Again</a></p>
        `);
      }
    }
  );
});

// 3. PROTECTED DASHBOARD
app.get('/selection.html', (req, res) => {
  // Simple session check (use real sessions in production)
  res.sendFile(path.join(__dirname, 'public', 'selection.html'));
});

// Route: Register Transfer
app.post('/register-transfer', (req, res) => {
  if (!isAuthenticated) return res.status(403).send('Forbidden');

  const { sender, receiver, amount, date, introNumber } = req.body;
  const transfer = {
    sender,
    receiver,
    amount: parseFloat(amount),
    currency: currency || 'USD',
    date: new Date().getDate.toISOString()
    }

    transfers.push(transfer);
    res.send(`
               <h2>✅ Transfer Registered!</h2>
               <p><strong>From:</strong></p>
               <p><strong>To:</strong> ${transfer.receiver}</p>
               <p><strong>Amount:</strong> ${transfer.amount} ${transfer.currency}</p>
              <a href="/dashboard">Register Another</a> | <a href="/transfers">View All</a>
  `);
  });
  
  // Insert into DB
  app.get('/transfers', (req, res) => {
  if (!isAuthenticated) return res.redirect('/');
  let html = `
    <h2>All Transfers</h2>
    <a href="/dashboard">← Back</a>
    <table border="1" style="border-collapse: collapse; margin-top: 20px;">
    <tr><th>ID</th><th>Sender</th><th>Receiver</th><th>Amount</th><th>Date</th></tr>
  `;
  transfers.forEach(t => {
    html += `
      <tr>
        <td>${t.id}</td>
        <td>${t.sender}</td>
        <td>${t.receiver}</td>
        <td>${t.amount} ${t.currency}</td>
        <td>${new Date(t.date).toLocaleString()}</td>
      </tr>
    `;
  });
  html += '</table>';
  res.send(html);
});

// 4. REGISTER NEW CUSTOMER (Bonus feature)
app.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  
  db.query(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
    [username, password, email],
    (err, result) => {
      if (err) {
        console.error('Register error:', err);
        return res.status(500).send('Registration failed');
      }
      console.log('✅ New user registered:', username);
      res.send('<h2>✅ Registered! <a href="/">Login now</a></h2>');
    }
  );
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});
