import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configuração para WebSocket (necessário para Neon)
neonConfig.webSocketConstructor = ws;

// Função para ler DATABASE_URL do .env prioritariamente
function getDatabaseUrl() {
  // Primeiro tenta ler do .env, depois das variáveis de ambiente do sistema
  const envFileUrl = process.env.DATABASE_URL;
  
  if (!envFileUrl) {
    throw new Error(
      "DATABASE_URL must be configured in .env file. This project requires PostgreSQL.",
    );
  }
  
  return envFileUrl;
}

const databaseUrl = getDatabaseUrl();

// Log para confirmar que está usando o banco configurado no .env
console.log(`[DB] Using PostgreSQL from .env: ${databaseUrl.split('@')[1]?.split('/')[0] || 'configured database'}`);

export const pool = new Pool({ 
  connectionString: databaseUrl,
  // Configurações para conexão estável
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle({ client: pool, schema });