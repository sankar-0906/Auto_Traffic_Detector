-- Fix token column length in refresh_tokens table
-- Run this SQL command in your MySQL database

-- First, drop the unique index
ALTER TABLE refresh_tokens DROP INDEX token;

-- Then modify the column to VARCHAR(500)
ALTER TABLE refresh_tokens MODIFY COLUMN token VARCHAR(500) NOT NULL;

-- Recreate the unique index
ALTER TABLE refresh_tokens ADD UNIQUE INDEX token (token);

