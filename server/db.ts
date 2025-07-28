import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

console.log(`🔗 Conectando ao PostgreSQL...`);

// Configuração do banco PostgreSQL usando variáveis de ambiente
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const connection = postgres(process.env.DATABASE_URL, { ssl: 'require' });

// Configurar Drizzle com PostgreSQL
export const db = drizzle(connection, { schema });

// Testar conexão
export async function testConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ Conexão PostgreSQL estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:", error);
    return false;
  }
}

// Reset completo do banco
export async function resetDatabase() {
  const { resetDatabase: resetDB } = await import("./reset-database");
  return await resetDB();
}

// Inicializar tabelas usando Drizzle
export async function initializeTables() {
  try {
    console.log("🏗️ Inicializando tabelas do schema PostgreSQL...");
    
    // With Drizzle and PostgreSQL Neon, schema is managed by migrations
    // Check if we need to create initial test data
    try {
      const userCount = await db.select().from(users).limit(1);
      if (userCount.length === 0) {
        console.log("🌱 Criando dados básicos de teste...");
        const { createSimpleSeedData } = await import("./simple-postgres-seed");
        await createSimpleSeedData();
      }
    } catch (error) {
      console.log("🌱 Tabelas não existem ainda, criando dados básicos...");
      const { createSimpleSeedData } = await import("./simple-postgres-seed");
      await createSimpleSeedData();
    }
    
    console.log("✅ Inicialização das tabelas concluída!");
  } catch (error) {
    console.error("❌ Erro na inicialização do banco:", error);
    throw error;
  }
}
