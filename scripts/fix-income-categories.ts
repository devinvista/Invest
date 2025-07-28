import '../server/env-protection';
import { db } from '../server/db';
import { categories } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function fixIncomeCategories() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    
    // Buscar todas as categorias de receita que têm classificação 50/30/20
    const incomeCategories = await db.select()
      .from(categories)
      .where(eq(categories.transactionType, 'income'));
    
    console.log(`📊 Encontradas ${incomeCategories.length} categorias de receita`);
    
    // Atualizar cada categoria de receita para remover a classificação 50/30/20
    for (const category of incomeCategories) {
      console.log(`🔄 Atualizando categoria: ${category.name} (${category.type} -> null)`);
      
      await db.update(categories)
        .set({ type: null })
        .where(eq(categories.id, category.id));
    }
    
    console.log('✅ Categorias de receita atualizadas com sucesso!');
    
    // Verificar resultado
    const updatedCategories = await db.select()
      .from(categories)
      .where(eq(categories.transactionType, 'income'));
    
    console.log('\n📋 Categorias de receita após atualização:');
    updatedCategories.forEach(cat => {
      console.log(`- ${cat.name} (type: ${cat.type}, transactionType: ${cat.transactionType})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar categorias:', error);
  } finally {
    process.exit(0);
  }
}

fixIncomeCategories();