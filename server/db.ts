import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configuração para WebSocket (necessário para Neon)
neonConfig.webSocketConstructor = ws;

// Garantir que sempre use a DATABASE_URL configurada (nunca banco nativo)
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. This project requires PostgreSQL - provision a database first.",
  );
}

// Log para confirmar que está usando PostgreSQL configurado
console.log(`[DB] Connecting to PostgreSQL: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured database'}`);

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Configurações adicionais para garantir conexão estável
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle({ client: pool, schema });