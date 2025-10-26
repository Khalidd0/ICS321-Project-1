// ============================================
// ADMIN CONTROLLER
// ============================================

const { pool } = require('../config/database');

/**
 * FUNCTION 1: Add a new race
 * POST /api/admin/race
 * Body: { raceId, raceName, trackName, raceDate, raceTime }
 * Calls: add_race
 */
async function addRace(req, res) {
  try {
    const { raceId, raceName, trackName } = req.body;
    let { raceDate, raceTime } = req.body;

    if (!raceId || !raceName || !trackName || !raceDate || !raceTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: raceId, raceName, trackName, raceDate, raceTime',
      });
    }

    // Call stored procedure
    await pool.query('CALL add_race(?, ?, ?, ?, ?)', [
      String(raceId),
      String(raceName),
      String(trackName),
      String(raceDate),
      String(raceTime),
    ]);

    res.status(201).json({
      success: true,
      message: 'Race added successfully',
      race: { raceId, raceName, trackName, raceDate, raceTime },
    });
  } catch (error) {
    console.error('Error in addRace:', error);
    if (String(error.message || '').includes('Track does not exist')) {
      return res.status(400).json({ success: false, message: 'Track does not exist' });
    }
    res.status(500).json({ success: false, message: 'Failed to add race', error: error.message });
  }
}

/**
 * FUNCTION 2: Add race result
 * POST /api/admin/race/result
 * Body: { raceId, horseId, result, prize }
 * Calls: add_race_result
 */
async function addRaceResult(req, res) {
  try {
    const { raceId, horseId, result } = req.body;
    let { prize } = req.body;

    if (!raceId || !horseId || !result || prize === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: raceId, horseId, result, prize',
      });
    }

    // Ensure numeric prize
    prize = Number(prize);

    await pool.query('CALL add_race_result(?, ?, ?, ?)', [
      String(raceId),
      String(horseId),
      String(result),
      prize,
    ]);

    res.status(201).json({
      success: true,
      message: 'Race result added successfully',
      result: { raceId, horseId, result, prize },
    });
  } catch (error) {
    console.error('Error in addRaceResult:', error);
    const msg = String(error.message || '');
    if (msg.includes('Race does not exist')) {
      return res.status(400).json({ success: false, message: 'Race does not exist' });
    }
    if (msg.includes('Horse does not exist')) {
      return res.status(400).json({ success: false, message: 'Horse does not exist' });
    }
    res.status(500).json({ success: false, message: 'Failed to add race result', error: error.message });
  }
}

/**
 * FUNCTION 3: Delete owner and related info
 * DELETE /api/admin/owner/:ownerId
 * Calls: delete_owner_and_related
 */
async function deleteOwner(req, res) {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'Owner ID is required' });
    }

    await pool.query('CALL delete_owner_and_related(?)', [String(ownerId)]);

    res.json({
      success: true,
      message: `Owner ${ownerId} and all related records deleted successfully`,
      deletedOwnerId: ownerId,
    });
  } catch (error) {
    console.error('Error in deleteOwner:', error);
    res.status(500).json({ success: false, message: 'Failed to delete owner', error: error.message });
  }
}

/**
 * FUNCTION 4: Move horse to another stable
 * PUT /api/admin/horse/:horseId/stable
 * Body: { newStableId }  <-- controller default
 * UI currently sends: { toStableId }  <-- we also accept this
 * Calls: move_horse_to_stable
 */

// Get current stable for a horse
async function getHorseInfo(req, res) {
  try {
    const { horseId } = req.params;
    if (!horseId) {
      return res.status(400).json({ success: false, message: 'Horse ID is required' });
    }
    const [rows] = await pool.query(
      'SELECT horseId, stableId FROM Horse WHERE horseId = ?',
      [String(horseId)]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }
    return res.json({ success: true, horse: rows[0] });
  } catch (err) {
    console.error('Error in getHorseInfo:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch horse', error: err.message });
  }
}

async function moveHorseToStable(req, res) {
  try {
    const { horseId } = req.params;
    // Accept either field name (be flexible for the UI)
    const newStableId = req.body.newStableId || req.body.toStableId;

    if (!horseId) {
      return res.status(400).json({ success: false, message: 'Horse ID is required' });
    }
    if (!newStableId) {
      return res.status(400).json({
        success: false,
        message: 'New stable ID is required in request body (newStableId or toStableId)',
      });
    }

    await pool.query('CALL move_horse_to_stable(?, ?)', [String(horseId), String(newStableId)]);

    res.json({
      success: true,
      message: `Horse ${horseId} moved to stable ${newStableId} successfully`,
      horseId,
      newStableId,
    });
  } catch (error) {
    console.error('Error in moveHorseToStable:', error);
    res.status(500).json({ success: false, message: 'Failed to move horse', error: error.message });
  }
}
// Get current stable for a horse



/**
 * FUNCTION 5: Approve a trainer
 * POST /api/admin/trainer
 * Controller originally expected: { trainerId, fname, lname, stableId }
 * Current UI sends: { trainerId, stableId, status } (no names)
 * We’ll accept both; if names missing, use placeholders so the proc can run.
 * Calls: approve_trainer
 */
async function approveTrainer(req, res) {
  try {
    const { trainerId, stableId } = req.body;
    let { fname, lname, status } = req.body;

    if (!trainerId || !stableId) {
      return res.status(400).json({
        success: false,
        message: 'trainerId and stableId are required',
      });
    }

    // Provide defaults if UI didn’t include names
    fname = fname || 'First';
    lname = lname || 'Last';
    status = status || 'Approved'; // not used by the proc, but nice to echo back

    await pool.query('CALL approve_trainer(?, ?, ?, ?)', [
      String(trainerId),
      String(fname),
      String(lname),
      String(stableId),
    ]);

    res.status(201).json({
      success: true,
      message: 'Trainer approved successfully',
      trainer: { trainerId, fname, lname, stableId, status },
    });
  } catch (error) {
    console.error('Error in approveTrainer:', error);
    res.status(500).json({ success: false, message: 'Failed to approve trainer', error: error.message });
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  addRace,
  addRaceResult,
  deleteOwner,
  moveHorseToStable,
  approveTrainer,
  getHorseInfo,         
};

