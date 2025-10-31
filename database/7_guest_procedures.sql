USE HorseRacing;
DELIMITER $$

/* ============================
   A) Owner → Horses + Trainer
   ============================ */
DROP PROCEDURE IF EXISTS get_owner_horses_trainers $$
CREATE PROCEDURE get_owner_horses_trainers(IN p_lname VARCHAR(30))
BEGIN
  SELECT
    h.horseName,
    h.age,
    CONCAT(t.fname, ' ', t.lname) AS trainerName
  FROM Owner o
  JOIN Owns  ow ON ow.ownerId = o.ownerId
  JOIN Horse h  ON h.horseId  = ow.horseId
  JOIN Trainer t ON t.stableId = h.stableId
  WHERE o.lname = p_lname
  ORDER BY h.horseName, t.lname, t.fname;
END $$

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
DROP PROCEDURE IF EXISTS get_trainer_total_winnings $$
CREATE PROCEDURE get_trainer_total_winnings()
BEGIN
  /* FIXED: Removed WHERE clause - now sums ALL prizes, not just first place */
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
  -- REMOVED: WHERE rr.results = 'first' 
  -- NOW CORRECTLY SUMS ALL PRIZE MONEY FROM ALL PLACEMENTS
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
  SELECT
    tr.trackName,
    COUNT(DISTINCT r.raceId)  AS raceCount,
    COUNT(DISTINCT rr.horseId) AS totalHorses
  FROM Track tr
  LEFT JOIN Race r        ON r.trackName = tr.trackName
  LEFT JOIN RaceResults rr ON rr.raceId = r.raceId
  GROUP BY tr.trackName
  ORDER BY raceCount DESC, totalHorses DESC, tr.trackName;
END $$

DELIMITER ;