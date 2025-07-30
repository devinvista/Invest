-- Add metadata columns to assets table for enhanced API integration
ALTER TABLE assets ADD COLUMN IF NOT EXISTS exchange text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS coingecko_id text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_quote_update timestamp;