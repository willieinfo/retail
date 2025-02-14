
require('dotenv').config()
const sql = require('mssql'); // Import the mssql library

// Configuration for SQL Server
const config = {
  user: process.env.DB_USER,  
  password: process.env.DB_PASSWORD,
  server:  process.env.DB_SERVER,
  database:  process.env.DB_DATABASE,
    options: {
    trustServerCertificate: true,  
    encrypt: false,  
    enableArithAbort: true  
  },
  port: 1433
};

// Connect to SQL Server and export the connection pool
async function connect() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err; // Throw the error to be handled by the caller
  }
}

// You can also export a helper function for executing queries directly
async function queryDatabase(query, params = {}) {
  const pool = await connect();
  const request = pool.request();

  // Add parameters dynamically to the query
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }

  // Execute the query
  const result = await request.query(query);
  pool.close();

  // Check if the query is a SELECT query or an UPDATE/INSERT/DELETE query
  if (query.trim().toUpperCase().startsWith("SELECT")) {
    // If it's a SELECT query, return the recordset
    return result.recordset;
  } else {
    // Otherwise, return rowsAffected (for UPDATE/INSERT/DELETE queries)
    return result.rowsAffected;
  }
}


module.exports = { connect, queryDatabase };
