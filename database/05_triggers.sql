
USE HorseRacing;

CREATE TABLE IF NOT EXISTS old_info (
  horseId      VARCHAR(15),
  horseName    VARCHAR(15),
  age          INT,
  gender       CHAR(1),
  registration INT,
  stableId     VARCHAR(30),
  deleted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$

DROP TRIGGER IF EXISTS trg_horse_archive_before_delete $$
CREATE TRIGGER trg_horse_archive_before_delete
BEFORE DELETE ON Horse
FOR EACH ROW
BEGIN
  INSERT INTO old_info (horseId, horseName, age, gender, registration, stableId)
  VALUES (OLD.horseId, OLD.horseName, OLD.age, OLD.gender, OLD.registration, OLD.stableId);
END $$

DELIMITER ;