/*
  guestController.js
  -------------------
  Purpose: Controller for guest (read-only) API endpoints.
  - Calls stored procedures defined in `database/7_guest_procedures.sql`.
  - Each exported function handles an Express request and returns JSON.
  Non-functional change: only added explanatory comments.
*/
const {pool}=require("../config/database");

async function getOwnerHorsesTrainers(req, res) {
  try {
    // STEP 1: Get owner last name from URL parameter
    // Example URL: /api/guest/owner/Mohammed/horses
    const { lname } = req.params;
    
    // STEP 2: Validate input (check if lname was provided)
    if (!lname) {
      return res.status(400).json({
        success: false,
        message: 'Owner last name is required'
      });
    }
    
    // STEP 3: Call stored procedure
    // Your SQL: get_owner_horses_trainers(IN p_lname VARCHAR(15))
    const [rows] = await pool.query(
      'CALL get_owner_horses_trainers(?)',
      [lname]
    );
    
    // STEP 4: Format and send response
    res.json({
      success: true,
      ownerLastName: lname,
      horses: rows[0],  // Stored procedure returns results in rows[0]
      count: rows[0].length
    });
    
  } catch (error) {
    console.error('Error in getOwnerHorsesTrainers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch horses',
      error: error.message
    });
  }
}

async function getTrainersWithWins(req, res) {
  try {
    // Call stored procedure (no parameters needed)
    const [rows] = await pool.query('CALL get_trainers_with_wins()');
    
    res.json({
      success: true,
      trainers: rows[0],
      count: rows[0].length
    });
    
  } catch (error) {
    console.error('Error in getTrainersWithWins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers with wins',
      error: error.message
    });
  }
}

async function getTrainerTotalWinnings(req, res) {
  try {
    const [rows] = await pool.query('CALL get_trainer_total_winnings()');
    
    res.json({
      success: true,
      trainers: rows[0],
      count: rows[0].length
    });
    
  } catch (error) {
    console.error('Error in getTrainerTotalWinnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer winnings',
      error: error.message
    });
  }
}

async function getTrackStats(req, res) {
  try {
    const [rows] = await pool.query('CALL get_track_stats()');
    
    res.json({
      success: true,
      tracks: rows[0],
      count: rows[0].length
    });
    
  } catch (error) {
    console.error('Error in getTrackStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch track statistics',
      error: error.message
    });
  }
}

module.exports = {
  getOwnerHorsesTrainers,
  getTrainersWithWins,
  getTrainerTotalWinnings,
  getTrackStats
};