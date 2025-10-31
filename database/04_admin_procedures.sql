USE HorseRacing;
DELIMITER $$

-- ============================================
-- Delete owner AND their horses
-- Only deletes horses that have NO OTHER OWNERS
-- Safe mode compatible version
-- ============================================
DROP PROCEDURE IF EXISTS delete_owner_and_related $$
CREATE PROCEDURE delete_owner_and_related(IN p_ownerId VARCHAR(15))
BEGIN
  -- Create temporary table to store horses that should be deleted
  DROP TEMPORARY TABLE IF EXISTS horses_to_delete;
  CREATE TEMPORARY TABLE horses_to_delete (
    horseId VARCHAR(15) PRIMARY KEY
  );
  
  START TRANSACTION;
  
  -- Find horses owned ONLY by this owner (no other owners)
  INSERT INTO horses_to_delete (horseId)
  SELECT o1.horseId
  FROM Owns o1
  WHERE o1.ownerId = p_ownerId
  AND NOT EXISTS (
    SELECT 1 
    FROM Owns o2 
    WHERE o2.horseId = o1.horseId 
    AND o2.ownerId != p_ownerId
  );
  
  -- CORRECT DELETE ORDER (respect foreign keys):
  
  -- 1. Delete race results first (child of Horse)
  DELETE rr FROM RaceResults rr
  INNER JOIN horses_to_delete htd ON rr.horseId = htd.horseId;
  
  -- 2. Delete ALL Owns records for horses to be deleted (child of Horse)
  DELETE o FROM Owns o
  INNER JOIN horses_to_delete htd ON o.horseId = htd.horseId;
  
  -- 3. Now safe to delete the horses (parent)
  DELETE h FROM Horse h
  INNER JOIN horses_to_delete htd ON h.horseId = htd.horseId;
  
  -- 4. Delete any remaining ownership relationships for this owner
  DELETE FROM Owns WHERE ownerId = p_ownerId;
  
  -- 5. Finally delete the owner
  DELETE FROM Owner WHERE ownerId = p_ownerId;
  
  COMMIT;
  
  -- Clean up temporary table
  DROP TEMPORARY TABLE IF EXISTS horses_to_delete;
END $$

-- ============================================
-- OTHER ADMIN PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS move_horse_to_stable $$ 
CREATE PROCEDURE move_horse_to_stable(IN p_horseId VARCHAR(15), IN p_newStable VARCHAR(30))
BEGIN
  START TRANSACTION;
  UPDATE Horse 
  SET stableId = p_newStable 
  WHERE horseId = p_horseId;
  COMMIT;
END $$

DROP PROCEDURE IF EXISTS approve_trainer $$
CREATE PROCEDURE approve_trainer(
  IN p_trainerId VARCHAR(15), 
  IN p_fname VARCHAR(30), 
  IN p_lname VARCHAR(30), 
  IN p_stableId VARCHAR(30))
BEGIN
  START TRANSACTION;
  INSERT INTO Trainer(trainerId, fname, lname, stableId)
  VALUES (p_trainerId, p_fname, p_lname, p_stableId);
  COMMIT;
END $$

DROP PROCEDURE IF EXISTS add_race $$
CREATE PROCEDURE add_race(
  IN p_raceId VARCHAR(15), 
  IN p_raceName VARCHAR(50),
  IN p_track VARCHAR(50), 
  IN p_date DATE, 
  IN p_time TIME
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Error adding race';
  END;
  
  START TRANSACTION;
  
  -- Check if track exists
  IF NOT EXISTS (SELECT 1 FROM Track WHERE trackName = p_track) THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Track does not exist';
  END IF;
  
  INSERT INTO Race(raceId, raceName, trackName, raceDate, raceTime)
  VALUES (p_raceId, p_raceName, p_track, p_date, p_time);
  
  COMMIT;
END $$

DROP PROCEDURE IF EXISTS add_race_result $$
CREATE PROCEDURE add_race_result(
  IN p_raceId VARCHAR(15), 
  IN p_horseId VARCHAR(15),
  IN p_result VARCHAR(15), 
  IN p_prize DECIMAL(12,2)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Error adding race result';
  END;
  
  START TRANSACTION;
  
  -- Validate race exists
  IF NOT EXISTS (SELECT 1 FROM Race WHERE raceId = p_raceId) THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Race does not exist';
  END IF;
  
  -- Validate horse exists
  IF NOT EXISTS (SELECT 1 FROM Horse WHERE horseId = p_horseId) THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Horse does not exist';
  END IF;
  
  INSERT INTO RaceResults(raceId, horseId, results, prize)
  VALUES (p_raceId, p_horseId, p_result, p_prize);
  
  COMMIT;
END $$

DELIMITER ;