USE HorseRacing;
DELIMITER $$

/* ============================
   A) Owner → Horses + Trainer
   ============================ */
USE HorseRacing;

DROP PROCEDURE IF EXISTS get_owner_horses_trainers;

DELIMITER $$

CREATE PROCEDURE get_owner_horses_trainers(IN p_lname VARCHAR(30))
BEGIN
  SELECT
    h.horseName,
    h.age,
    CONCAT(t.fname, ' ', t.lname) AS trainerName
  FROM Owner o
  JOIN Owns  ow ON ow.ownerId = o.ownerId
  JOIN Horse h  ON h.horseId  = ow.horseId
  JOIN Trainer t ON t.stableId = h.stableId    -- all trainers in that stable
  WHERE o.lname = p_lname
  ORDER BY h.horseName, t.lname, t.fname;
END$$



 


/* =======================================
   B) Trainers who have winners (detail)
   ======================================= */
DROP PROCEDURE IF EXISTS get_trainers_with_wins $$
CREATE PROCEDURE get_trainers_with_wins()
BEGIN
  /* Attribute each winning horse to the chosen stable trainer (same pick logic) */
  WITH pick AS (
    SELECT stableId, MIN(CONCAT(lname, ',', fname)) AS pick
    FROM Trainer
    GROUP BY stableId
  )
  SELECT
    CONCAT(t.fname, ' ', t.lname) AS trainerName,
    h.horseName                   AS horseName,
    r.raceName                    AS raceName,
    rr.results                    AS result,
    r.raceDate                    AS raceDate
  FROM Horse h
  JOIN pick p ON p.stableId = h.stableId
  JOIN Trainer t
    ON t.stableId = p.stableId
   AND CONCAT(t.lname, ',', t.fname) = p.pick
  JOIN RaceResults rr ON rr.horseId = h.horseId
  JOIN Race r         ON r.raceId   = rr.raceId
  WHERE rr.results = 'first'
  ORDER BY r.raceDate DESC, trainerName, horseName;
END $$

/* ==========================================
   C) Trainer total winnings (aggregated)
   ========================================== */
USE HorseRacing;
DELIMITER $$

DROP PROCEDURE IF EXISTS get_trainer_total_winnings $$
CREATE PROCEDURE get_trainer_total_winnings()
BEGIN
  /* Pick one deterministic trainer per stable to avoid double counting */
  WITH pick AS (
    SELECT stableId, MIN(CONCAT(lname, ',', fname)) AS pick
    FROM Trainer
    GROUP BY stableId
  )
  SELECT
    CONCAT(t.fname, ' ', t.lname) AS trainerName,
    SUM(rr.prize)                 AS totalPrize
  FROM Horse h
  JOIN pick p ON p.stableId = h.stableId
  JOIN Trainer t
    ON t.stableId = p.stableId
   AND CONCAT(t.lname, ',', t.fname) = p.pick
  JOIN RaceResults rr ON rr.horseId = h.horseId
  WHERE rr.results = 'first'
  GROUP BY trainerName
  ORDER BY totalPrize DESC, trainerName;
END $$



/* ===============================
   D) Track summary (UI-friendly)
   =============================== */
DROP PROCEDURE IF EXISTS get_track_stats $$
CREATE PROCEDURE get_track_stats()
BEGIN
  /* Aliases match UI: raceCount, totalHorses */
 SELECT tr.trachName, COUNT(DISTINCT r.raceId) AS races_count, COUNT(DISTINCT rr.horseId) AS
 total_participants  FROM Track tr  LEFT JOIN Race r ON r.trackName = tr.trackName  LEFT JOIN
 RaceResults rr ON rr.raceId = r.raceId  GROUP BY tr.trackName  ORDER BY races_count
 DESC, total_participants DESC, tr.trackName;
 
END $$

DELIMITER ;
