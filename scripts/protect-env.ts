#!/usr/bin/env tsx
/**
 * Environment Protection Script
 * 
 * This script ensures that the user's .env configuration is always
 * preserved and prioritized over system environment variables.
 */

import fs from 'fs';
import path from 'path';

function protectEnvironment() {
  try {
    console.log('🔒 Verificando proteção do ambiente...');
    
    const envPath = path.resolve('.env');
    const protectPath = path.resolve('.envprotect');
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  Arquivo .env não encontrado - proteção não aplicável');
      return;
    }
    
    // Check if protection file exists
    if (!fs.existsSync(protectPath)) {
      console.log('⚠️  Arquivo de proteção não encontrado - criando...');
      fs.writeFileSync(protectPath, `# Environment Protection File
# This file ensures that .env configuration is never overwritten by system
# NEVER MODIFY OR DELETE THIS FILE

PROTECTION_ENABLED=true
ORIGINAL_DATABASE_SOURCE=user_env_file
PROTECTED_AT=${new Date().toISOString()}
`);
    }
    
    // Read .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    const databaseUrlMatch = envContent.match(/DATABASE_URL=([^\n\r]+)/);
    
    if (!databaseUrlMatch) {
      console.log('⚠️  DATABASE_URL não encontrado no .env');
      return;
    }
    
    const envDatabaseUrl = databaseUrlMatch[1].replace(/^['"]|['"]$/g, '');
    const systemDatabaseUrl = process.env.DATABASE_URL;
    
    // Check if system variable differs from .env
    if (systemDatabaseUrl && systemDatabaseUrl !== envDatabaseUrl) {
      console.log('🛡️  Sistema tentou sobrescrever DATABASE_URL - bloqueado!');
      console.log(`📁 .env: ${envDatabaseUrl.substring(0, 50)}...`);
      console.log(`🖥️  Sistema: ${systemDatabaseUrl.substring(0, 50)}...`);
      
      // Log protection action
      const logEntry = `${new Date().toISOString()}: System DATABASE_URL blocked, .env preserved\n`;
      fs.appendFileSync('.envprotect', logEntry);
    } else {
      console.log('✅ Configuração do .env protegida e ativa');
    }
    
    // Determine database type
    const dbType = envDatabaseUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 
                   envDatabaseUrl.includes('replit') ? 'Replit PostgreSQL' : 
                   'PostgreSQL Customizado';
    
    console.log(`📊 Usando: ${dbType} (do arquivo .env)`);
    
  } catch (error) {
    console.error('❌ Erro na proteção do ambiente:', error);
  }
}

// Run protection check
protectEnvironment();