// ============================================
// ADMIN ROUTES
// ============================================
// This file defines all API endpoints for ADMIN users

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  addRace,
  addRaceResult,
  deleteOwner,
  moveHorseToStable,
  approveTrainer,
  getHorseInfo,
} = require('../controllers/adminController');

// Debug logging
console.log('🔍 Admin Controller Functions Loaded:');
console.log('  - addRace:', typeof addRace);
console.log('  - addRaceResult:', typeof addRaceResult);
console.log('  - deleteOwner:', typeof deleteOwner);
console.log('  - moveHorseToStable:', typeof moveHorseToStable);
console.log('  - approveTrainer:', typeof approveTrainer);

// ============================================
// ROUTE DEFINITIONS
// ============================================

/**
 * ROUTE 1: Add a new race
 * 
 * Method: POST
 * URL: POST /api/admin/race
 * Body: {
 *   raceId: "race37",
 *   raceName: "Dubai Cup",
 *   trackName: "Dubai",
 *   raceDate: "2025-11-01",
 *   raceTime: "14:00"
 * }
 */
router.post('/race', addRace);
console.log('✅ Route registered: POST /race');

/**
 * ROUTE 2: Add race result
 * 
 * Method: POST
 * URL: POST /api/admin/race/result
 * Body: {
 *   raceId: "race37",
 *   horseId: "horse1",
 *   result: "first",
 *   prize: 100000
 * }
 */
router.post('/race/result', addRaceResult);
console.log('✅ Route registered: POST /race/result');

/**
 * ROUTE 3: Delete owner
 * 
 * Method: DELETE
 * URL: DELETE /api/admin/owner/:ownerId
 * Example: DELETE /api/admin/owner/owner1
 */
router.delete('/owner/:ownerId', deleteOwner);
console.log('✅ Route registered: DELETE /owner/:ownerId');

/**
 * ROUTE 4: Move horse to stable
 * 
 * Method: PUT
 * URL: PUT /api/admin/horse/:horseId/stable
 * Example: PUT /api/admin/horse/horse1/stable
 * Body: { newStableId: "stable2" }
 */
router.put('/horse/:horseId/stable', moveHorseToStable);
console.log('✅ Route registered: PUT /horse/:horseId/stable');

/**
 * ROUTE 5: Approve new trainer
 * 
 * Method: POST
 * URL: POST /api/admin/trainer
 * Body: {
 *   trainerId: "trainer9",
 *   fname: "Ahmed",
 *   lname: "Ali",
 *   stableId: "stable1"
 * }
 */
router.post('/trainer', approveTrainer);
console.log('✅ Route registered: POST /trainer');

router.get('/horse/:horseId', getHorseInfo);

// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;