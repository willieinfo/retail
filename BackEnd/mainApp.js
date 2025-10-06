
// Remember to install the following first:
// npm install express
// npm install cors
// npm install mssql
// npm install dotenv
// npm install socket.io

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());

app.use(cors());
app.use('/src', express.static(path.join(__dirname, '..', 'src')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use('/graphics', express.static(path.join(__dirname, '..', 'graphics')));
app.use('/data', express.static(path.join(__dirname, '..', 'data')));

const productRouter = require('./Routers/productRouter');  
const lookupRouter = require('./Routers/lookupRouter');      
const salesRouter = require('./Routers/salesRouter');      
const stockRouter = require('./Routers/stockRouter');      
const purchRouter = require('./Routers/purchRouter');      
const invenRouter = require('./Routers/invenRouter');      

// Retail App Routers with CORS enabled per router
app.use('/product', cors(), productRouter);
app.use('/lookup', cors(), lookupRouter);
app.use('/sales', cors(), salesRouter);
app.use('/transfers', cors(), stockRouter);
app.use('/purchases', cors(), purchRouter);
app.use('/inventory', cors(), invenRouter);

app.get('/', (req, res) => {
  // redirect root → /retail
  res.redirect('/retail');
});

app.get('/retail', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'RetailApp.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'WinChat.html'));
});

// 🔹 Start server
const server = app.listen(3000, '0.0.0.0', () => {
  console.log('API Server is running on port 3000');
});

// 🔹 Initialize Chat Server (backend Socket.IO logic)
const { initializeChatServer } = require('./Controllers/WinChat/ChatServer');
initializeChatServer(server);

// Gracefully handle SIGINT (Ctrl + C) and shutdown the DB connection pool
process.on('SIGINT', async () => {
  console.log('Closing database connection pool...');
  try {
    const { sql } = require('../BackEnd/DBConnect/dbConnect'); // Assuming the sql object is exported from DbConnect.js
    await sql.close();  // Close the connection pool when the app shuts down
    console.log('Database connection pool closed');
  } catch (err) {
    console.error('Error closing DB connection:', err);
  } finally {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0); // Exit the process after closing the server
    });
  }
})

