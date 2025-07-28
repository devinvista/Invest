import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log(`🔗 Connecting to PostgreSQL...`);

// PostgreSQL database configuration using environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const connection = postgres(process.env.DATABASE_URL, { ssl: 'require' });

// Configure Drizzle with PostgreSQL
export const db = drizzle(connection, { schema });

// Test connection
export async function testConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ PostgreSQL connection established successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error);
    return false;
  }
}

// Initialize tables using Drizzle
export async function initializeTables() {
  try {
    console.log("🏗️ Initializing PostgreSQL schema tables...");
    
    // With Drizzle and PostgreSQL, schema is managed by migrations
    // Check if we need to create initial test data
    try {
      const userCount = await db.select().from(users).limit(1);
      if (userCount.length === 0) {
        console.log("🌱 Creating basic test data...");
        await createInitialData();
      }
    } catch (error) {
      console.log("🌱 Tables don't exist yet, will be created by migrations...");
    }
    
    console.log("✅ Database initialization completed!");
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    throw error;
  }
}

// Create initial admin user and basic data
async function createInitialData() {
  try {
    // This will be handled by migrations and seeding scripts
    console.log("📊 Initial data creation will be handled by migrations");
  } catch (error) {
    console.error("❌ Error creating initial data:", error);
  }
}
