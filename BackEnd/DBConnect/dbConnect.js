
require('dotenv').config()

// Import the mssql library
const sql = require('mssql'); 

// Configuration for SQL Server
const config = {
  user: process.env.DB_USER,  
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,  
    encrypt: false,  
    enableArithAbort: true  
  },
  port: 1433,
  requestTimeout: 120000  // <- Increase to 60 seconds  
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

// Query execution function
async function queryDatabase(query, params = {}) {
  const pool = await connect();
  const request = pool.request();

  // Add parameters dynamically to the query
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }

  try {
    // Execute the query
    const result = await request.query(query);
    pool.close();

    // Check if the query is a SELECT query
    if (query.trim().toUpperCase().startsWith("SELECT")) {
      return result.recordset;  // Return the result set for SELECT queries
    } else {
      // For INSERT/UPDATE/DELETE, check if SCOPE_IDENTITY() was included in the query

      if (query.toUpperCase().includes('SCOPE_IDENTITY')) {
        // Return the auto-generated ID (from SCOPE_IDENTITY)
        return result.recordset[0];
      }
      // For other non-SELECT queries, return rows affected
      return result.rowsAffected;
    }
  } catch (err) {
    pool.close();
    console.error('Database query error:', err);
    throw err; // Throw the error for further handling by the caller
  }
}

module.exports = { connect, queryDatabase };

