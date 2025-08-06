-- Add exchange column to assets table if it doesn't exist
ALTER TABLE assets ADD COLUMN IF NOT EXISTS exchange VARCHAR(50) DEFAULT 'B3';