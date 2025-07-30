import { db } from "../server/db.js";
import { sql } from "drizzle-orm";

async function fixDatabaseSchema() {
  try {
    console.log("🔧 Fixing database schema...");
    
    // Create transaction_status enum if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE transaction_status AS ENUM ('confirmed', 'pending');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Create recurrence_frequency enum if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Add status column to transactions table if it doesn't exist
    await db.execute(sql`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS status transaction_status DEFAULT 'confirmed' NOT NULL;
    `);
    
    // Add recurrence_id column to transactions table if it doesn't exist
    await db.execute(sql`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS recurrence_id uuid;
    `);
    
    // Add installments columns if they don't exist
    await db.execute(sql`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS installments integer DEFAULT 1;
    `);
    
    await db.execute(sql`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS current_installment integer DEFAULT 1;
    `);
    
    // Create recurrences table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS recurrences (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) NOT NULL,
        account_id uuid REFERENCES accounts(id),
        credit_card_id uuid REFERENCES credit_cards(id),
        category_id uuid REFERENCES categories(id) NOT NULL,
        type transaction_type NOT NULL,
        amount decimal(12,2) NOT NULL,
        description text NOT NULL,
        frequency recurrence_frequency NOT NULL,
        start_date timestamp NOT NULL,
        end_date timestamp,
        is_active boolean DEFAULT true NOT NULL,
        installments integer DEFAULT 1,
        next_execution_date timestamp NOT NULL,
        last_executed_date timestamp,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Add foreign key constraint for recurrence_id if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transactions_recurrence_id 
        FOREIGN KEY (recurrence_id) REFERENCES recurrences(id);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log("✅ Database schema fixed successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error fixing schema:", error);
    process.exit(1);
  }
}

fixDatabaseSchema();