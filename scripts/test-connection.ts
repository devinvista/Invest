#!/usr/bin/env tsx
/**
 * Database Connection Test Script
 * Tests which database server is actually connected
 */

import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function testDatabaseConnection() {
  try {
    console.log('=== TESTE DE CONEXÃO DO BANCO ===\n');
    
    // Test basic connection
    console.log('1. Testando conexão básica...');
    const basicTest = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Get database information
    console.log('\n2. Informações do servidor:');
    const dbInfo = await db.execute(sql`
      SELECT 
        current_database() as database_name,
        current_user as username,
        version() as server_version,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    
    const info = dbInfo[0];
    console.log(`   📊 Database: ${info.database_name}`);
    console.log(`   👤 User: ${info.username}`);
    console.log(`   🖥️  Server IP: ${info.server_ip || 'localhost'}`);
    console.log(`   🔌 Port: ${info.server_port || 'default'}`);
    console.log(`   📦 Version: ${info.server_version.substring(0, 50)}...`);
    
    // Check if it's Neon or Replit database
    console.log('\n3. Tipo de servidor:');
    if (info.server_version.includes('neon') || info.server_ip?.includes('aws')) {
      console.log('   🌟 Neon PostgreSQL (AWS)');
    } else if (info.server_ip?.includes('replit') || info.server_ip?.includes('127.0.0.1')) {
      console.log('   🔧 Replit PostgreSQL (Local)');
    } else {
      console.log('   🗄️  PostgreSQL Customizado');
    }
    
    // Test table access
    console.log('\n4. Testando acesso às tabelas...');
    const tableTest = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `);
    
    console.log(`   📋 Tabelas encontradas: ${tableTest.length}`);
    tableTest.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check users table
    console.log('\n5. Verificando usuários...');
    const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    console.log(`   👥 Total de usuários: ${userCount[0].count}`);
    
    console.log('\n✅ TESTE CONCLUÍDO - Usando banco do arquivo .env');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
  }
}

testDatabaseConnection();