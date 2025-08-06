// Fix exchange column in assets table
import { sql } from 'drizzle-orm';
import { db } from '../server/db';

async function fixExchangeColumn() {
  try {
    console.log('🔧 Adding exchange column to assets table...');
    
    await db.execute(sql`
      ALTER TABLE assets 
      ADD COLUMN IF NOT EXISTS exchange TEXT DEFAULT 'B3';
    `);
    
    console.log('✅ Exchange column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding exchange column:', error);
    process.exit(1);
  }
}

fixExchangeColumn();