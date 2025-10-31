/*
  src/routes/guestRoutes.js
  -------------------------
  Purpose: Define Express routes for guest (read-only) endpoints and wire
  them to controller functions in `src/controllers/guestController.js`.
  Non-functional change: header comment only.
*/
// ============================================
// GUEST ROUTES
// ============================================
// This file defines all API endpoints for GUEST users

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getOwnerHorsesTrainers,
  getTrainersWithWins,
  getTrainerTotalWinnings,
  getTrackStats
} = require('../controllers/guestController');

// Debug logging
console.log('🔍 Guest Controller Functions Loaded:');
console.log('  - getOwnerHorsesTrainers:', typeof getOwnerHorsesTrainers);
console.log('  - getTrainersWithWins:', typeof getTrainersWithWins);
console.log('  - getTrainerTotalWinnings:', typeof getTrainerTotalWinnings);
console.log('  - getTrackStats:', typeof getTrackStats);


// ============================================
// ROUTE DEFINITIONS
// ============================================

router.get('/owner/:lname/horses', getOwnerHorsesTrainers);
console.log('✅ Route registered: GET /owner/:lname/horses');

router.get('/trainers/winners', getTrainersWithWins);
console.log('✅ Route registered: GET /trainers/winners');

router.get('/trainers/winnings', getTrainerTotalWinnings);
console.log('✅ Route registered: GET /trainers/winnings');

router.get('/tracks/stats', getTrackStats);
console.log('✅ Route registered: GET /tracks/stats');

// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;