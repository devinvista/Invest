-- Add 'investment' to transaction_type enum
-- Note: PostgreSQL doesn't allow adding enum values in a transaction, so we need to use separate statements

-- First, check if 'investment' already exists in the enum
DO $$ 
BEGIN
    -- Check if the enum value already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'investment' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'transaction_type'
        )
    ) THEN
        -- Add the new enum value
        ALTER TYPE transaction_type ADD VALUE 'investment';
    END IF;
END $$;