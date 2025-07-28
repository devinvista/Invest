import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories, users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
});

const db = drizzle(sql);

// Categorias padrão seguindo metodologia 50/30/20
const defaultCategories = [
  // NECESSIDADES (50%) - Essenciais para sobrevivência
  {
    name: "Moradia",
    type: "necessities" as const,
    transactionType: "expense" as const,
    color: "#B71C1C",
    icon: "Home",
    description: "Aluguel, financiamento, condomínio, IPTU e despesas de habitação"
  },
  {
    name: "Alimentação",
    type: "necessities" as const,
    transactionType: "expense" as const,
    color: "#E65100",
    icon: "ShoppingCart",
    description: "Supermercado, feira, produtos básicos para alimentação"
  },
  {
    name: "Transporte",
    type: "necessities" as const,
    transactionType: "expense" as const,
    color: "#EF6C00",
    icon: "Car",
    description: "Combustível, transporte público, manutenção de veículo"
  },
  {
    name: "Saúde",
    type: "necessities" as const,
    transactionType: "expense" as const,
    color: "#C62828",
    icon: "Heart",
    description: "Plano de saúde, consultas, exames, medicamentos essenciais"
  },
  {
    name: "Serviços Essenciais",
    type: "necessities" as const,
    transactionType: "expense" as const,
    color: "#AD1457",
    icon: "Zap",
    description: "Luz, água, gás, telefone, internet básica"
  },
  {
    name: "Educação Básica",
    type: "necessities" as const,
    transactionType: "expense" as const,
    color: "#6A1B9A",
    icon: "BookOpen",
    description: "Escola dos filhos, material escolar, cursos profissionalizantes"
  },
  {
    name: "Impostos e Seguros",
    type: "necessities" as const,
    transactionType: "expense" as const,
    color: "#4527A0",
    icon: "FileText",
    description: "Imposto de renda, IPVA, seguros obrigatórios"
  },

  // DESEJOS (30%) - Estilo de vida e lazer
  {
    name: "Entretenimento",
    type: "wants" as const,
    transactionType: "expense" as const,
    color: "#1565C0",
    icon: "PlayCircle",
    description: "Cinema, streaming, jogos, shows, atividades de lazer"
  },
  {
    name: "Restaurantes",
    type: "wants" as const,
    transactionType: "expense" as const,
    color: "#0277BD",
    icon: "Coffee",
    description: "Restaurantes, delivery, lanches, cafés"
  },
  {
    name: "Compras e Presentes",
    type: "wants" as const,
    transactionType: "expense" as const,
    color: "#0288D1",
    icon: "Gift",
    description: "Roupas, eletrônicos, presentes, compras não essenciais"
  },
  {
    name: "Viagens e Turismo",
    type: "wants" as const,
    transactionType: "expense" as const,
    color: "#0097A7",
    icon: "Plane",
    description: "Viagens, hotéis, passeios, turismo"
  },
  {
    name: "Hobbies",
    type: "wants" as const,
    transactionType: "expense" as const,
    color: "#00796B",
    icon: "Camera",
    description: "Equipamentos para hobbies, atividades recreativas"
  },
  {
    name: "Cuidados Pessoais",
    type: "wants" as const,
    transactionType: "expense" as const,
    color: "#388E3C",
    icon: "User",
    description: "Salão, spa, cosméticos, produtos de beleza"
  },
  {
    name: "Assinaturas",
    type: "wants" as const,
    transactionType: "expense" as const,
    color: "#689F38",
    icon: "Smartphone",
    description: "Assinaturas de apps, revistas, serviços premium"
  },

  // POUPANÇA/INVESTIMENTOS (20%) - Futuro financeiro
  {
    name: "Reserva de Emergência",
    type: "savings" as const,
    transactionType: "expense" as const,
    color: "#795548",
    icon: "Shield",
    description: "Construção da reserva de emergência (6-12 meses de gastos)"
  },
  {
    name: "Investimentos",
    type: "savings" as const,
    transactionType: "expense" as const,
    color: "#607D8B",
    icon: "TrendingUp",
    description: "Ações, fundos, renda fixa, previdência privada"
  },
  {
    name: "Objetivos Futuros",
    type: "savings" as const,
    transactionType: "expense" as const,
    color: "#546E7A",
    icon: "Target",
    description: "Poupança para objetivos específicos (casa, carro, aposentadoria)"
  },

  // RECEITAS - Fontes de renda (sem classificação 50/30/20)
  {
    name: "Salário",
    transactionType: "income" as const,
    color: "#2E7D32",
    icon: "DollarSign",
    description: "Salário fixo mensal, 13º salário"
  },
  {
    name: "Renda Extra",
    transactionType: "income" as const,
    color: "#388E3C",
    icon: "Plus",
    description: "Freelances, trabalhos extras, vendas ocasionais"
  },
  {
    name: "Rendimentos",
    transactionType: "income" as const,
    color: "#43A047",
    icon: "PiggyBank",
    description: "Juros de investimentos, dividendos, rendimentos"
  },
  {
    name: "Outras Receitas",
    transactionType: "income" as const,
    color: "#4CAF50",
    icon: "Wallet",
    description: "Outras fontes de renda não categorizadas"
  }
];

async function createDefaultCategories() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    
    // Verifica se já existem categorias padrão
    const existingDefaults = await db.select()
      .from(categories)
      .where(eq(categories.isDefault, true));
    
    if (existingDefaults.length > 0) {
      console.log('⚠️  Categorias padrão já existem no banco de dados');
      console.log(`📊 Encontradas ${existingDefaults.length} categorias padrão`);
      
      // Mostra as categorias existentes
      console.log('\n📋 Categorias existentes:');
      existingDefaults.forEach(cat => {
        console.log(`- ${cat.name} (${cat.type}, ${cat.transactionType})`);
      });
      
      // Verifica se precisamos adicionar mais categorias
      if (existingDefaults.length < defaultCategories.length) {
        console.log(`\n🔄 Adicionando ${defaultCategories.length - existingDefaults.length} categorias faltantes...`);
        
        const existingNames = existingDefaults.map(cat => cat.name);
        const missingCategories = defaultCategories.filter(cat => !existingNames.includes(cat.name));
        
        // Busca um usuário existente para usar como referência para categorias padrão
        const existingUser = await db.select().from(users).limit(1);
        if (existingUser.length === 0) {
          console.log('❌ Nenhum usuário encontrado. Crie um usuário primeiro.');
          return;
        }
        
        for (const category of missingCategories) {
          await db.insert(categories).values({
            ...category,
            isDefault: true,
            userId: existingUser[0].id
          });
          console.log(`✅ Adicionada: ${category.name}`);
        }
        
        console.log(`\n🎉 ${missingCategories.length} novas categorias adicionadas!`);
      }
      
      return;
    }

    console.log('📝 Criando categorias padrão...');
    
    // Busca um usuário existente para usar como referência para categorias padrão
    const existingUser = await db.select().from(users).limit(1);
    if (existingUser.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Crie um usuário primeiro.');
      return;
    }
    
    for (const category of defaultCategories) {
      await db.insert(categories).values({
        ...category,
        isDefault: true,
        userId: existingUser[0].id
      });
    }
    
    console.log(`✅ ${defaultCategories.length} categorias padrão criadas com sucesso!`);
    console.log('');
    console.log('📋 Categorias criadas:');
    console.log('🏠 NECESSIDADES (50%): 7 categorias');
    console.log('🎯 DESEJOS (30%): 7 categorias');
    console.log('💰 POUPANÇA (20%): 3 categorias');
    console.log('💵 RECEITAS: 4 categorias');
    console.log('');
    console.log('👥 Estas categorias serão copiadas automaticamente para novos usuários');
    
  } catch (error) {
    console.error('❌ Erro ao criar categorias padrão:', error);
  } finally {
    await sql.end();
  }
}

createDefaultCategories();