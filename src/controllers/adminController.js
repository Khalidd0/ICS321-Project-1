// ============================================
// ADMIN CONTROLLER
// ============================================
// This file handles all ADMIN functions (create, update, delete operations)

const { pool } = require('../config/database');

/**
 * FUNCTION 1: Add a new race
 * 
 * HTTP Method: POST
 * Body required: {
 *   raceId: "race37",
 *   raceName: "Dubai Cup", 
 *   trackName: "Dubai",
 *   raceDate: "2025-11-01",
 *   raceTime: "14:00"
 * }
 * 
 * Calls stored procedure: add_race
 */

async function addRace(req, res) {
  try {
    // STEP 1: Get data from request body
    const { raceId, raceName, trackName, raceDate, raceTime } = req.body;
    
    // STEP 2: Validate all required fields
    if (!raceId || !raceName || !trackName || !raceDate || !raceTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: raceId, raceName, trackName, raceDate, raceTime'
      });
    }
    
    // STEP 3: Call stored procedure
    await pool.query(
      'CALL add_race(?, ?, ?, ?, ?)',
      [raceId, raceName, trackName, raceDate, raceTime]
    );
    
    // STEP 4: Send success response
    res.status(201).json({
      success: true,
      message: 'Race added successfully',
      race: {
        raceId,
        raceName,
        trackName,
        raceDate,
        raceTime
      }
    });
    
  } catch (error) {
    console.error('Error in addRace:', error);
    
    // Check for specific errors
    if (error.message.includes('Track does not exist')) {
      return res.status(400).json({
        success: false,
        message: 'Track does not exist',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add race',
      error: error.message
    });
  }
}

/**
 * FUNCTION 2: Add race result
 * 
 * HTTP Method: POST
 * Body required: {
 *   raceId: "race37",
 *   horseId: "horse1",
 *   result: "first",
 *   prize: 100000
 * }
 * 
 * Calls stored procedure: add_race_result
 * 
 * Note: This should be called AFTER addRace() for each horse in the race
 */

async function addRaceResult(req, res) {
  try {
    const { raceId, horseId, result, prize } = req.body;
    
    // Validate required fields
    if (!raceId || !horseId || !result || prize === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: raceId, horseId, result, prize'
      });
    }
    
    // Call stored procedure
    await pool.query(
      'CALL add_race_result(?, ?, ?, ?)',
      [raceId, horseId, result, prize]
    );
    
    res.status(201).json({
      success: true,
      message: 'Race result added successfully',
      result: {
        raceId,
        horseId,
        result,
        prize
      }
    });
    
  } catch (error) {
    console.error('Error in addRaceResult:', error);
    
    // Check for specific errors
    if (error.message.includes('Race does not exist')) {
      return res.status(400).json({
        success: false,
        message: 'Race does not exist'
      });
    }
    
    if (error.message.includes('Horse does not exist')) {
      return res.status(400).json({
        success: false,
        message: 'Horse does not exist'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add race result',
      error: error.message
    });
  }
}

/**
 * FUNCTION 3: Delete owner and related information
 * 
 * HTTP Method: DELETE
 * URL parameter: ownerId
 * Example: DELETE /api/admin/owner/owner1
 * 
 * Calls stored procedure: delete_owner_and_related
 * 
 * Warning: This deletes the owner AND all ownership records!
 */

async function deleteOwner(req, res) {
  try {
    // Get ownerId from URL parameter
    const { ownerId } = req.params;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }
    
    // Call stored procedure
    await pool.query(
      'CALL delete_owner_and_related(?)',
      [ownerId]
    );
    
    res.json({
      success: true,
      message: `Owner ${ownerId} and all related records deleted successfully`,
      deletedOwnerId: ownerId
    });
    
  } catch (error) {
    console.error('Error in deleteOwner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete owner',
      error: error.message
    });
  }
}

/**
 * FUNCTION 4: Move horse to another stable
 * 
 * HTTP Method: PUT
 * URL parameter: horseId
 * Body required: { newStableId: "stable2" }
 * Example: PUT /api/admin/horse/horse1/stable
 * 
 * Calls stored procedure: move_horse_to_stable
 */

async function moveHorseToStable(req, res) {
  try {
    const { horseId } = req.params;
    const { newStableId } = req.body;
    
    // Validate inputs
    if (!horseId) {
      return res.status(400).json({
        success: false,
        message: 'Horse ID is required'
      });
    }
    
    if (!newStableId) {
      return res.status(400).json({
        success: false,
        message: 'New stable ID is required in request body'
      });
    }
    
    // Call stored procedure
    await pool.query(
      'CALL move_horse_to_stable(?, ?)',
      [horseId, newStableId]
    );
    
    res.json({
      success: true,
      message: `Horse ${horseId} moved to stable ${newStableId} successfully`,
      horseId,
      newStableId
    });
    
  } catch (error) {
    console.error('Error in moveHorseToStable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move horse',
      error: error.message
    });
  }
}

/**
 * FUNCTION 5: Approve a new trainer
 * 
 * HTTP Method: POST
 * Body required: {
 *   trainerId: "trainer9",
 *   fname: "Ahmed",
 *   lname: "Ali",
 *   stableId: "stable1"
 * }
 * 
 * Calls stored procedure: approve_trainer
 */

async function approveTrainer(req, res) {
  try {
    const { trainerId, fname, lname, stableId } = req.body;
    
    // Validate all required fields
    if (!trainerId || !fname || !lname || !stableId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: trainerId, fname, lname, stableId'
      });
    }
    
    // Call stored procedure
    await pool.query(
      'CALL approve_trainer(?, ?, ?, ?)',
      [trainerId, fname, lname, stableId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Trainer approved successfully',
      trainer: {
        trainerId,
        fname,
        lname,
        stableId
      }
    });
    
  } catch (error) {
    console.error('Error in approveTrainer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve trainer',
      error: error.message
    });
  }
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

module.exports = {
  addRace,
  addRaceResult,
  deleteOwner,
  moveHorseToStable,
  approveTrainer
};