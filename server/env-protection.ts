/**
 * Environment Protection Module
 * 
 * This module ensures that the .env file configuration is always
 * prioritized over system environment variables, preventing
 * automatic overwrites by the Replit system.
 */

import fs from 'fs';
import path from 'path';

export function getProtectedDatabaseUrl(): string {
  try {
    // Read .env file directly to ensure user's configuration is preserved
    const envPath = path.resolve('.env');
    
    if (!fs.existsSync(envPath)) {
      throw new Error('.env file not found');
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const databaseUrlMatch = envContent.match(/DATABASE_URL=([^\n\r]+)/);
    
    if (!databaseUrlMatch) {
      throw new Error('DATABASE_URL not found in .env file');
    }
    
    // Clean up the URL (remove quotes if present)
    const databaseUrl = databaseUrlMatch[1].replace(/^['"]|['"]$/g, '');
    
    // Log which database is being used for transparency
    const dbType = databaseUrl.includes('neon.tech') ? 'Neon PostgreSQL (from .env)' : 
                   databaseUrl.includes('replit') ? 'Replit PostgreSQL (from .env)' : 
                   'Custom PostgreSQL (from .env)';
    
    console.log(`🔒 Protected database connection: ${dbType}`);
    
    return databaseUrl;
    
  } catch (error) {
    console.error('❌ Error reading .env file:', error);
    console.log('⚠️  Falling back to system environment variable');
    
    // Only fallback to system env if .env reading fails
    const systemUrl = process.env.DATABASE_URL;
    if (!systemUrl) {
      throw new Error('No DATABASE_URL found in .env file or system environment');
    }
    
    return systemUrl;
  }
}

export function validateEnvProtection(): boolean {
  try {
    const protectedUrl = getProtectedDatabaseUrl();
    const systemUrl = process.env.DATABASE_URL;
    
    // Check if system variable differs from .env file
    if (systemUrl && systemUrl !== protectedUrl) {
      console.log('⚠️  System DATABASE_URL differs from .env - using .env configuration');
      return true;
    }
    
    console.log('✅ Environment protection active - using .env configuration');
    return true;
    
  } catch (error) {
    console.error('❌ Environment protection validation failed:', error);
    return false;
  }
}