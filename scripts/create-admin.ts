import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  try {
    console.log('🔍 Verificando se usuário "tom" já existe...');
    
    // Verificar se o usuário já existe
    const existingUser = await db.select().from(users).where(eq(users.username, 'tom'));
    
    if (existingUser.length > 0) {
      console.log('⚠️  Usuário "tom" já existe. Atualizando senha...');
      
      // Atualizar senha
      const hashedPassword = await bcrypt.hash('tom123', 10);
      await db.update(users)
        .set({ 
          password: hashedPassword,
          name: 'Tom Admin',
          email: 'tom@admin.com'
        })
        .where(eq(users.username, 'tom'));
      
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      console.log('👤 Criando novo usuário admin...');
      
      // Criar novo usuário
      const hashedPassword = await bcrypt.hash('tom123', 10);
      await db.insert(users).values({
        username: 'tom',
        password: hashedPassword,
        name: 'Tom Admin',
        email: 'tom@admin.com'
      });
      
      console.log('✅ Usuário admin criado com sucesso!');
    }
    
    console.log('\n📋 Credenciais:');
    console.log('Username: tom');
    console.log('Password: tom123');
    console.log('Email: tom@admin.com');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin();