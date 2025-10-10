USE HorseRacing;
DELIMITER $$

-- A) Owner → horses + trainers
DROP PROCEDURE IF EXISTS get_owner_horses_trainers $$
CREATE PROCEDURE get_owner_horses_trainers(IN p_lname VARCHAR(15))
BEGIN
  SELECT 
    h.horseName,
    h.age,
    t.fname,
    t.lname
  FROM Horse h
  INNER JOIN Trainer t ON t.stableId = h.stableId
  INNER JOIN Owns ow   ON ow.horseId = h.horseId
  INNER JOIN Owner o   ON o.ownerId  = ow.ownerId
  WHERE o.lname = p_lname
  ORDER BY h.horseName, t.lname, t.fname;
END $$

-- B) Trainers who have winners (detail rows)
USE HorseRacing;
DELIMITER $$

DROP PROCEDURE IF EXISTS get_trainers_with_wins $$

CREATE PROCEDURE get_trainers_with_wins()
BEGIN
  SELECT DISTINCT
    t.trainerId,
    t.fname,
    t.lname,
    h.horseName  AS winning_horse,
    r.raceName   AS winning_race,
    r.raceDate
  FROM Trainer t
  INNER JOIN Stable s     ON s.stableId = t.stableId
  INNER JOIN Horse h      ON h.stableId = s.stableId
  INNER JOIN RaceResults rr ON rr.horseId = h.horseId
  INNER JOIN Race r       ON r.raceId = rr.raceId
  WHERE rr.results = 'first'
  ORDER BY r.raceDate, t.lname, t.fname, h.horseName;
END $$


DROP PROCEDURE IF EXISTS get_trainer_total_winnings $$

CREATE PROCEDURE get_trainer_total_winnings()
BEGIN
  SELECT
    t.trainerId,           
    t.fname,
    t.lname,
    SUM(rr.prize) AS total_winnings_prize
  FROM Trainer t
  INNER JOIN Stable s     ON s.stableId = t.stableId
  INNER JOIN Horse  h     ON h.stableId = s.stableId
  INNER JOIN RaceResults rr ON rr.horseId  = h.horseId
  WHERE rr.results = 'first'                 
  GROUP BY t.trainerId, t.fname, t.lname
  ORDER BY total_winnings_prize DESC, t.lname, t.fname;
END $$


DROP PROCEDURE IF EXISTS get_track_stats $$

CREATE PROCEDURE get_track_stats()
BEGIN
  SELECT
    tr.trackName,
    COUNT(DISTINCT r.raceId)   AS races_count,
    COUNT(DISTINCT rr.horseId) AS total_participants
  FROM Track tr
  LEFT JOIN Race r ON r.trackName = tr.trackName
  LEFT JOIN RaceResults rr ON rr.raceId = r.raceId
  GROUP BY tr.trackName
  ORDER BY races_count DESC, total_participants DESC, tr.trackName;
END $$

DELIMITER ;