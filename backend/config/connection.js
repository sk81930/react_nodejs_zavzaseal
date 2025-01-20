const knex = require('knex');
const knexConfig = require('../knexfile.js');

// Initialize Knex instance with the configuration
const db = knex(knexConfig);

// Check if the connection works
async function checkConnection() {
  try {
    
    // Test the connection with a simple query (e.g., SELECT 1)
    let data =  await db.raw("SELECT 1");
    console.log('Database connection with: '+knexConfig.connection.database);
    return data;
    
  } catch (error) {
    console.error('Database connection failed:', error);
    return null;
   
  } finally {
    //return db.destroy(); // Close the database connection after checking
  }
}
checkConnection();
// Call the function to check connection
module.exports = db;