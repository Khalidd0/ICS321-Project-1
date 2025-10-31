--
-- database/03_indexes_constraints.sql
-- Purpose: Add indexes and constraints to improve query performance and data integrity.
-- Run this after schema and seed if needed.
--
CREATE INDEX horse_stableId_idx        ON Horse(stableId);
CREATE INDEX trainer_stableId_idx     ON Trainer(stableId);
CREATE INDEX owns_ownerId_idx          ON Owns(ownerId);
CREATE INDEX iowns_horseId_idx          ON Owns(horseId);
CREATE INDEX race_trackName_idx        ON Race(trackName);
CREATE INDEX raceresults_raceId_idx    ON RaceResults(raceId);
CREATE INDEX raceresults_horseId_idx   ON RaceResults(horseId);
CREATE INDEX owner_lname_idx           ON Owner(lname);

ALTER TABLE Horse
ADD CONSTRAINT check_horse_gender CHECK (gender IN ('F','M','G','C','S'));

ALTER TABLE Horse
ADD UNIQUE (registration);
