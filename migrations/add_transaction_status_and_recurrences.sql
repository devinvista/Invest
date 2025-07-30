-- Add status column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status transaction_status DEFAULT 'confirmed' NOT NULL;

-- Add recurrence_id column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_id UUID REFERENCES recurrences(id);

-- Create transaction_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('confirmed', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create recurrence_frequency enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create recurrences table
CREATE TABLE IF NOT EXISTS recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    account_id UUID REFERENCES accounts(id),
    credit_card_id UUID REFERENCES credit_cards(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    type transaction_type NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    frequency recurrence_frequency NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true NOT NULL,
    installments INTEGER DEFAULT 1,
    next_execution_date TIMESTAMP NOT NULL,
    last_executed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurrences_user_id ON recurrences(user_id);
CREATE INDEX IF NOT EXISTS idx_recurrences_next_execution ON recurrences(next_execution_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_recurrence_id ON transactions(recurrence_id);