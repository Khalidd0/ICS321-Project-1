/*
  server.js
  ---------
  Purpose: Application entry point — loads environment variables, verifies DB
  connectivity, and starts the Express server. Prints available endpoints
  to the console for developer convenience.
*/
// ============================================
// SERVER ENTRY POINT
// ============================================
// This file starts the Express server

require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    // Test database connection
    console.log('\n🔍 Testing database connection...\n');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('⚠️  WARNING: Database connection failed!');
      console.log('💡 Check your .env file\n');
    }
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Horse Racing API Server Started!');
      console.log('='.repeat(60));
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${process.env.DB_NAME}`);
      console.log('='.repeat(60));
      console.log('\n📌 GUEST Endpoints (GET):');
      console.log('   /api/guest/owner/:lname/horses');
      console.log('   /api/guest/trainers/winners');
      console.log('   /api/guest/trainers/winnings');
      console.log('   /api/guest/tracks/stats');
      console.log('\n📌 ADMIN Endpoints:');
      console.log('   POST   /api/admin/race');
      console.log('   POST   /api/admin/race/result');
      console.log('   DELETE /api/admin/owner/:ownerId');
      console.log('   PUT    /api/admin/horse/:horseId/stable');
      console.log('   POST   /api/admin/trainer');
      console.log('\n💡 Press Ctrl+C to stop\n');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();