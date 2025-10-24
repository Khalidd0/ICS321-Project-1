const mysql=require("mysql2/promise");
require("dotenv").config();

const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT, 
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0
});

async function testConnection() {
  try {
    // Try to get a connection from the pool
    const connection = await pool.getConnection();
    
    // If we got here, connection worked!
    console.log('✅ Successfully connected to MySQL database!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    
    // Give the connection back to the pool
    connection.release();
    
    return true;  // Success!
    
  } catch (error) {
    // If something went wrong, show the error
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    return false;  // Failed!
  }
}



module.exports={pool,testConnection};