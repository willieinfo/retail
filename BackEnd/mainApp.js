
// Remember to install the following first:
// npm install express
// npm install cors
// npm install mssql
// npm install dotenv

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const productRouter = require('./Routers/productRouter');  
const lookupRouter = require('./Routers/lookupRouter');      
const salesRouter = require('./Routers/salesRouter');      
const stockRouter = require('./Routers/stockRouter');      
const purchRouter = require('./Routers/purchRouter');      
const invenRouter = require('./Routers/invenRouter');      

// Use the different routers
app.use('/product', productRouter);
app.use('/lookup', lookupRouter);
app.use('/sales', salesRouter);  
app.use('/transfers', stockRouter);  
app.use('/purchases', purchRouter);  
app.use('/inventory', invenRouter);  

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


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