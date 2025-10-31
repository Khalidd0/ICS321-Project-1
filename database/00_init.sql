--
-- database/00_init.sql
-- Purpose: Create (drop if exists) the main `HorseRacing` database and select it.
-- Note: This file is safe to run when initializing the project DB. Comments added only.
--
DROP DATABASE IF EXISTS HorseRacing;
CREATE DATABASE HorseRacing ;
USE HorseRacing;