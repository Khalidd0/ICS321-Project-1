USE HorseRacing;

-- ============================================
-- ARCHIVE TABLES FOR AUDIT TRAIL
-- ============================================

-- Drop existing archive tables if they exist
DROP TABLE IF EXISTS old_owns_info;
DROP TABLE IF EXISTS old_owner_info;
DROP TABLE IF EXISTS old_horse_info;

-- Archive table for deleted horses
CREATE TABLE IF NOT EXISTS old_horse_info (
  horseId      VARCHAR(15),
  horseName    VARCHAR(15),
  age          INT,
  gender       CHAR(1),
  registration INT,
  stableId     VARCHAR(30),
  deleted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_by   VARCHAR(200) DEFAULT 'DIRECT_DELETE'
);

-- Archive table for deleted owners
CREATE TABLE IF NOT EXISTS old_owner_info (
  ownerId      VARCHAR(15),
  lname        VARCHAR(15),
  fname        VARCHAR(15),
  deleted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletion_reason VARCHAR(100) DEFAULT 'DIRECT_DELETE'
);

-- Archive table for ownership relationships when deleted
CREATE TABLE IF NOT EXISTS old_owns_info (
  ownerId      VARCHAR(15),
  horseId      VARCHAR(15),
  deleted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGER 1: Archive Horse Before Delete
-- ============================================

DELIMITER $$

DROP TRIGGER IF EXISTS trg_horse_archive_before_delete $$
CREATE TRIGGER trg_horse_archive_before_delete
BEFORE DELETE ON Horse
FOR EACH ROW
BEGIN
  INSERT INTO old_horse_info (horseId, horseName, age, gender, registration, stableId, deleted_by)
  VALUES (OLD.horseId, OLD.horseName, OLD.age, OLD.gender, OLD.registration, OLD.stableId, 
          'HORSE_DELETED');
END $$

-- ============================================
-- TRIGGER 2: Archive Owner Before Delete
-- ============================================

DROP TRIGGER IF EXISTS trg_owner_archive_before_delete $$
CREATE TRIGGER trg_owner_archive_before_delete
BEFORE DELETE ON Owner
FOR EACH ROW
BEGIN
  INSERT INTO old_owner_info (ownerId, lname, fname, deletion_reason)
  VALUES (OLD.ownerId, OLD.lname, OLD.fname, 'OWNER_DELETED');
END $$

-- ============================================
-- TRIGGER 3: Archive Ownership Relationship Before Delete
-- This captures the connection between owner and horse when relationship is broken
-- ============================================

DROP TRIGGER IF EXISTS trg_owns_archive_before_delete $$
CREATE TRIGGER trg_owns_archive_before_delete
BEFORE DELETE ON Owns
FOR EACH ROW
BEGIN
  -- Store ownership relationship (just IDs for speed)
  INSERT INTO old_owns_info (ownerId, horseId)
  VALUES (OLD.ownerId, OLD.horseId);
END $$

DELIMITER ;


