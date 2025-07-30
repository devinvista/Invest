import { db } from '../server/db.ts';
import { sql } from 'drizzle-orm';

async function migrateAssets() {
  try {
    console.log('🔄 Adding asset metadata columns...');
    
    // Add metadata columns to assets table
    await sql`
      ALTER TABLE assets 
      ADD COLUMN IF NOT EXISTS exchange text,
      ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL',
      ADD COLUMN IF NOT EXISTS coingecko_id text,
      ADD COLUMN IF NOT EXISTS region text,
      ADD COLUMN IF NOT EXISTS last_quote_update timestamp;
    `;
    
    console.log('✅ Asset metadata columns added successfully');
    
    // Update existing assets with default values
    await sql`
      UPDATE assets 
      SET currency = 'BRL', 
          last_quote_update = NOW()
      WHERE currency IS NULL OR last_quote_update IS NULL;
    `;
    
    console.log('✅ Existing assets updated with default values');
    console.log('🎉 Asset metadata migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateAssets();