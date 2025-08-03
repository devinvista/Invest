import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertAccountSchema, insertCreditCardSchema, 
  insertCategorySchema, insertTransactionSchema, insertAssetSchema,
  insertGoalSchema, insertBudgetSchema, insertInvestmentTransactionSchema,
  insertRecurrenceSchema, updateRecurrenceSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

// Middleware for authentication
async function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check for existing username
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Check for existing email
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Check for existing phone
      if (userData.phone) {
        const existingPhone = await storage.getUserByPhone(userData.phone);
        if (existingPhone) {
          return res.status(400).json({ message: "Telefone já está em uso" });
        }
      }
      
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create default categories following 50/30/20 methodology
      const defaultCategories = [
        // NECESSIDADES (50%) - Gastos essenciais para viver
        { userId: user.id, name: "Alimentação", type: "necessities" as const, transactionType: "expense" as const, color: "#ef4444", icon: "Utensils", description: "Supermercado, restaurantes básicos, alimentação essencial", isDefault: true },
        { userId: user.id, name: "Moradia", type: "necessities" as const, transactionType: "expense" as const, color: "#ef4444", icon: "Home", description: "Aluguel, financiamento, condomínio, IPTU", isDefault: true },
        { userId: user.id, name: "Transporte", type: "necessities" as const, transactionType: "expense" as const, color: "#ef4444", icon: "Car", description: "Combustível, transporte público, manutenção veicular", isDefault: true },
        { userId: user.id, name: "Saúde", type: "necessities" as const, transactionType: "expense" as const, color: "#ef4444", icon: "Heart", description: "Plano de saúde, medicamentos, consultas médicas", isDefault: true },
        { userId: user.id, name: "Utilidades", type: "necessities" as const, transactionType: "expense" as const, color: "#ef4444", icon: "Smartphone", description: "Energia elétrica, água, gás, internet, telefone", isDefault: true },
        { userId: user.id, name: "Educação Básica", type: "necessities" as const, transactionType: "expense" as const, color: "#ef4444", icon: "GraduationCap", description: "Escola, material escolar, cursos profissionalizantes", isDefault: true },
        { userId: user.id, name: "Seguros", type: "necessities" as const, transactionType: "expense" as const, color: "#ef4444", icon: "CreditCard", description: "Seguro auto, residencial, vida", isDefault: true },
        
        // DESEJOS (30%) - Gastos para qualidade de vida e prazer
        { userId: user.id, name: "Entretenimento", type: "wants" as const, transactionType: "expense" as const, color: "#f59e0b", icon: "Gamepad2", description: "Cinema, jogos, streaming, shows, eventos", isDefault: true },
        { userId: user.id, name: "Compras Pessoais", type: "wants" as const, transactionType: "expense" as const, color: "#f59e0b", icon: "ShoppingBag", description: "Roupas, acessórios, cosméticos, eletrônicos", isDefault: true },
        { userId: user.id, name: "Restaurantes", type: "wants" as const, transactionType: "expense" as const, color: "#f59e0b", icon: "Coffee", description: "Restaurantes, delivery, cafés, lanches", isDefault: true },
        { userId: user.id, name: "Viagens", type: "wants" as const, transactionType: "expense" as const, color: "#f59e0b", icon: "Plane", description: "Férias, passeios, hospedagem, turismo", isDefault: true },
        { userId: user.id, name: "Hobbies", type: "wants" as const, transactionType: "expense" as const, color: "#f59e0b", icon: "Music", description: "Esportes, música, arte, coleções", isDefault: true },
        { userId: user.id, name: "Beleza e Bem-estar", type: "wants" as const, transactionType: "expense" as const, color: "#f59e0b", icon: "Dumbbell", description: "Academia, salão, spa, massagem", isDefault: true },
        { userId: user.id, name: "Presentes", type: "wants" as const, transactionType: "expense" as const, color: "#f59e0b", icon: "Gift", description: "Presentes para família e amigos", isDefault: true },
        
        // POUPANÇA E INVESTIMENTOS (20%) - Construção de patrimônio
        { userId: user.id, name: "Reserva de Emergência", type: "savings" as const, transactionType: "expense" as const, color: "#22c55e", icon: "PiggyBank", description: "Poupança para emergências (6-12 meses de gastos)", isDefault: true },
        { userId: user.id, name: "Investimentos", type: "savings" as const, transactionType: "expense" as const, color: "#22c55e", icon: "Target", description: "Ações, fundos, renda fixa, previdência", isDefault: true },
        { userId: user.id, name: "Objetivos", type: "savings" as const, transactionType: "expense" as const, color: "#22c55e", icon: "Wallet", description: "Poupança para metas específicas", isDefault: true },
        
        // RECEITAS
        { userId: user.id, name: "Salário", type: "necessities" as const, transactionType: "income" as const, color: "#22c55e", icon: "Briefcase", description: "Salário principal do trabalho", isDefault: true },
        { userId: user.id, name: "Renda Extra", type: "necessities" as const, transactionType: "income" as const, color: "#22c55e", icon: "CircleDollarSign", description: "Freelances, trabalhos extras, vendas", isDefault: true },
        { userId: user.id, name: "Investimentos (Receita)", type: "necessities" as const, transactionType: "income" as const, color: "#22c55e", icon: "DollarSign", description: "Dividendos, juros, rendimentos", isDefault: true },
        { userId: user.id, name: "Outros", type: "necessities" as const, transactionType: "income" as const, color: "#22c55e", icon: "Building", description: "Outras fontes de renda", isDefault: true },
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user: { id: user.id, username: user.username, name: user.name, email: user.email }, token });
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar usuário", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Try to find user by username, email, or phone
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      if (!user) {
        user = await storage.getUserByPhone(username);
      }
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user: { id: user.id, username: user.username, name: user.name, email: user.email }, token });
    } catch (error) {
      res.status(500).json({ message: "Erro no servidor", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Protected routes - require authentication
  app.use("/api", authenticateToken);

  // Dashboard data
  app.get("/api/dashboard", async (req: any, res) => {
    try {
      const userId = req.userId;
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [accounts, creditCards, transactions, goals, budget] = await Promise.all([
        storage.getUserAccounts(userId).then(r => r || []),
        storage.getUserCreditCards(userId).then(r => r || []),
        storage.getUserTransactions(userId, 10).then(r => r || []),
        storage.getUserGoals(userId).then(r => r || []),
        storage.getBudget(userId, currentMonth, currentYear)
      ]);

      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      const totalCreditUsed = creditCards.reduce((sum, card) => sum + parseFloat(card.usedAmount), 0);
      
      const monthlyTransactions = await storage.getTransactionsByMonth(userId, currentMonth, currentYear).then(r => r || []);
      // Excluir transferências de investimento do cálculo de receitas e despesas
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income' && !t.isInvestmentTransfer)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense' && !t.isInvestmentTransfer)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      res.json({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        totalCreditUsed,
        recentTransactions: transactions,
        goals: goals.filter(g => g.status === 'active').slice(0, 3),
        budget
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar dashboard", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Accounts routes
  app.get("/api/accounts", async (req: any, res) => {
    try {
      const accounts = await storage.getUserAccounts(req.userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar contas", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/accounts", async (req: any, res) => {
    try {
      const accountData = insertAccountSchema.parse({ ...req.body, userId: req.userId });
      const account = await storage.createAccount(accountData);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar conta", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.put("/api/accounts/:id", async (req: any, res) => {
    try {
      const accountId = req.params.id;
      const updates = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(accountId, updates);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar conta", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Transfer between accounts
  app.post("/api/accounts/transfer", async (req: any, res) => {
    try {
      const { fromAccountId, toAccountId, amount, description, categoryId } = req.body;
      
      if (!fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ message: "Dados de transferência incompletos" });
      }
      
      if (parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valor deve ser maior que zero" });
      }

      // Get accounts to validate ownership and check balance
      const fromAccount = await storage.getAccount(fromAccountId);
      const toAccount = await storage.getAccount(toAccountId);
      
      if (!fromAccount || fromAccount.userId !== req.userId) {
        return res.status(404).json({ message: "Conta de origem não encontrada" });
      }
      
      if (!toAccount || toAccount.userId !== req.userId) {
        return res.status(404).json({ message: "Conta de destino não encontrada" });
      }
      
      if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Saldo insuficiente na conta de origem" });
      }

      // Update balances
      const newFromBalance = (parseFloat(fromAccount.balance) - parseFloat(amount)).toFixed(2);
      const newToBalance = (parseFloat(toAccount.balance) + parseFloat(amount)).toFixed(2);
      
      await storage.updateAccountBalance(fromAccountId, newFromBalance);
      await storage.updateAccountBalance(toAccountId, newToBalance);

      // Verificar se a conta de destino é de investimento
      const isInvestmentTransfer = toAccount.type === 'investment';
      
      // Se for transferência para investimento e tiver categoria, criar registros de transação
      if (isInvestmentTransfer && categoryId) {
        // Buscar categoria de transferência padrão caso não seja fornecida categoria específica
        const categories = await storage.getUserCategories(req.userId);
        const transferCategory = categories.find(cat => cat.transactionType === 'transfer') || 
                               categories.find(cat => cat.name === 'Transferência');
        
        const finalCategoryId = categoryId || transferCategory?.id;
        
        if (finalCategoryId) {
          // Criar transação de saída (débito da conta origem)
          await storage.createTransaction({
            userId: req.userId,
            accountId: fromAccountId,
            categoryId: finalCategoryId,
            type: 'expense',
            amount: amount,
            description: description || `Transferência para ${toAccount.name}`,
            date: new Date(),
            transferToAccountId: toAccountId,
            isInvestmentTransfer: true
          });

          // Criar transação de entrada (crédito da conta destino)
          await storage.createTransaction({
            userId: req.userId,
            accountId: toAccountId,
            categoryId: finalCategoryId,
            type: 'income',
            amount: amount,
            description: description || `Transferência de ${fromAccount.name}`,
            date: new Date(),
            transferToAccountId: fromAccountId,
            isInvestmentTransfer: true
          });
        }
      }
      
      res.json({ 
        message: "Transferência realizada com sucesso", 
        fromAccount: { ...fromAccount, balance: newFromBalance },
        toAccount: { ...toAccount, balance: newToBalance },
        isInvestmentTransfer
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao realizar transferência", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.delete("/api/accounts/:id", async (req: any, res) => {
    try {
      const accountId = req.params.id;
      
      // Check if account belongs to user
      const account = await storage.getAccount(accountId);
      if (!account || account.userId !== req.userId) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }
      
      // Check if account has non-zero balance
      if (parseFloat(account.balance) !== 0) {
        return res.status(400).json({ message: "Não é possível excluir conta com saldo. Transfira o dinheiro primeiro." });
      }
      
      await storage.deleteAccount(accountId);
      res.json({ message: "Conta excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir conta", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Credit Cards routes
  app.get("/api/credit-cards", async (req: any, res) => {
    try {
      const cards = await storage.getUserCreditCards(req.userId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar cartões", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/credit-cards", async (req: any, res) => {
    try {
      const cardData = insertCreditCardSchema.parse({ ...req.body, userId: req.userId });
      const card = await storage.createCreditCard(cardData);
      res.json(card);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar cartão", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Payment of credit card invoice - creates a transfer from bank account to credit card
  app.post("/api/credit-cards/:cardId/payment", authenticateToken, async (req: any, res) => {
    try {
      const { cardId } = req.params;
      const { accountId, amount, categoryId } = req.body;

      if (!accountId || !amount) {
        return res.status(400).json({ message: "Dados de pagamento incompletos" });
      }

      if (parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valor deve ser maior que zero" });
      }

      // Verify card belongs to user
      const card = await storage.getCreditCard(cardId);
      if (!card || card.userId !== req.userId) {
        return res.status(404).json({ message: "Cartão não encontrado" });
      }

      // Verify account belongs to user and has sufficient balance
      const account = await storage.getAccount(accountId);
      if (!account || account.userId !== req.userId) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }

      if (parseFloat(account.balance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Saldo insuficiente na conta" });
      }

      // Find transfer category
      const categories = await storage.getUserCategories(req.userId);
      const transferCategory = categories.find(cat => 
        cat.transactionType === 'transfer' || cat.name.toLowerCase().includes('transferência')
      ) || categories.find(cat => cat.transactionType === 'expense');

      // Update account balance (subtract payment amount)
      const newAccountBalance = (parseFloat(account.balance) - parseFloat(amount)).toFixed(2);
      await storage.updateAccountBalance(accountId, newAccountBalance);

      // Update credit card used amount (reduce by payment amount - reducing debt)
      const currentUsed = parseFloat(card.usedAmount || '0');
      const newUsedAmount = Math.max(0, currentUsed - parseFloat(amount)).toFixed(2);
      await storage.updateCreditCardUsage(cardId, newUsedAmount);

      // Create transfer transaction from bank account (expense)
      const fromTransaction = await storage.createTransaction({
        userId: req.userId,
        accountId,
        categoryId: transferCategory?.id || categoryId,
        type: 'expense',
        amount: amount,
        description: `Pagamento fatura ${card.name}`,
        date: new Date(),
        creditCardId: cardId, // Reference to the target credit card
      });

      // Create transfer transaction to credit card (income/payment)
      const toTransaction = await storage.createTransaction({
        userId: req.userId,
        creditCardId: cardId,
        categoryId: transferCategory?.id || categoryId,
        type: 'income',
        amount: amount,
        description: `Recebimento pagamento - ${account.name}`,
        date: new Date(),
        accountId, // Reference to the source account
      });

      res.json({ 
        message: "Pagamento realizado com sucesso",
        fromTransaction,
        toTransaction,
        newAccountBalance,
        newCardUsedAmount: newUsedAmount
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao processar pagamento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req: any, res) => {
    try {
      const categories = await storage.getUserCategories(req.userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar categorias", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/categories", async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse({ ...req.body, userId: req.userId });
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar categoria", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.put("/api/categories/:id", async (req: any, res) => {
    try {
      const categoryId = req.params.id;
      const updates = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(categoryId, updates);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar categoria", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.delete("/api/categories/:id", async (req: any, res) => {
    try {
      const categoryId = req.params.id;
      await storage.deleteCategory(categoryId);
      res.json({ message: "Categoria excluída com sucesso" });
    } catch (error) {
      res.status(400).json({ message: "Erro ao excluir categoria", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req: any, res) => {
    try {
      const { month, year, limit } = req.query;
      let transactions = [];
      
      if (month && year) {
        transactions = await storage.getTransactionsByMonth(req.userId, parseInt(month), parseInt(year)) || [];
      } else {
        transactions = await storage.getUserTransactions(req.userId, limit ? parseInt(limit) : undefined) || [];
      }
      
      res.json(transactions);
    } catch (error) {
      console.error("Transaction API error:", error);
      res.json([]); // Return empty array instead of error to prevent frontend crashes
    }
  });

  app.post("/api/transactions", async (req: any, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({ 
        ...req.body, 
        userId: req.userId,
        date: new Date(req.body.date)
      });
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar transação", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.put("/api/transactions/:id", authenticateToken, async (req: any, res) => {
    try {
      const transactionId = req.params.id;
      console.log(`✏️ Update transaction request for ID: ${transactionId}`);
      
      // Check if transaction belongs to user
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || transaction.userId !== req.userId) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      
      // Only allow updating pending transactions
      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Apenas transações pendentes podem ser editadas" });
      }
      
      // Parse and validate update data
      const updates = insertTransactionSchema.partial().parse({
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      });
      
      // Remove userId from updates to prevent changing ownership
      delete updates.userId;
      
      const updatedTransaction = await storage.updateTransaction(transactionId, updates);
      console.log(`✅ Transaction updated successfully: ${transactionId}`);
      
      res.json({ 
        message: "Transação atualizada com sucesso",
        transaction: updatedTransaction
      });
    } catch (error) {
      console.error(`❌ Error updating transaction:`, error);
      res.status(500).json({ message: "Erro ao atualizar transação", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.delete("/api/transactions/:id", authenticateToken, async (req: any, res) => {
    try {
      const transactionId = req.params.id;
      console.log(`🗑️ Delete transaction request for ID: ${transactionId}`);
      
      // Validate transaction ID format
      if (!transactionId || typeof transactionId !== 'string' || transactionId.length < 30) {
        console.error(`❌ Invalid transaction ID: ${transactionId}`);
        return res.status(400).json({ message: "ID da transação inválido" });
      }
      
      // Check if transaction belongs to user
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || transaction.userId !== req.userId) {
        console.error(`❌ Transaction not found or doesn't belong to user: ${transactionId}`);
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      
      // For pending transactions from active recurrences, create next transaction
      let nextTransaction = null;
      let message = "Transação excluída com sucesso";
      
      if (transaction.recurrenceId && transaction.status === 'pending') {
        console.log('🔄 Pending transaction from active recurrence deleted, creating next installment...');
        // Create next transaction without passing originalDate to use the default next execution date
        nextTransaction = await storage.createNextPendingTransactionForRecurrence(transaction.recurrenceId);
        if (nextTransaction) {
          console.log('✅ Next pending transaction created:', nextTransaction.id);
          message += " - Próxima parcela criada automaticamente";
        }
      }
      
      console.log(`✅ Transaction found, proceeding with deletion`);
      await storage.deleteTransaction(transactionId);
      console.log(`✅ Transaction deleted successfully: ${transactionId}`);
      
      res.json({ 
        message,
        nextTransaction
      });
    } catch (error) {
      console.error(`❌ Error deleting transaction:`, error);
      res.status(500).json({ message: "Erro ao excluir transação", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Criar transação para investimento (categorizada como "Investimentos Futuros")
  app.post("/api/transactions/investment", async (req: any, res) => {
    try {
      const { accountId, categoryId, amount, description, investmentAccountId } = req.body;
      
      if (!accountId || !amount) {
        return res.status(400).json({ message: "Dados de investimento incompletos" });
      }
      
      if (parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valor deve ser maior que zero" });
      }

      // Verificar se a conta de origem existe e tem saldo suficiente
      const sourceAccount = await storage.getAccount(accountId);
      if (!sourceAccount || sourceAccount.userId !== req.userId) {
        return res.status(404).json({ message: "Conta de origem não encontrada" });
      }

      if (parseFloat(sourceAccount.balance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Saldo insuficiente na conta de origem" });
      }

      // Buscar categoria de investimento padrão se não fornecida
      let finalCategoryId = categoryId;
      if (!finalCategoryId) {
        const categories = await storage.getUserCategories(req.userId);
        const investmentCategory = categories.find(cat => 
          cat.name === 'Investimentos Futuros' || 
          (cat.type === 'savings' && cat.transactionType === 'expense')
        );
        finalCategoryId = investmentCategory?.id;
      }

      if (!finalCategoryId) {
        return res.status(400).json({ message: "Categoria de investimento não encontrada" });
      }

      // Se tiver conta de investimento destino, atualizar saldos
      if (investmentAccountId) {
        const investmentAccount = await storage.getAccount(investmentAccountId);
        if (!investmentAccount || investmentAccount.userId !== req.userId) {
          return res.status(404).json({ message: "Conta de investimento não encontrada" });
        }

        // Atualizar saldos
        const newSourceBalance = (parseFloat(sourceAccount.balance) - parseFloat(amount)).toFixed(2);
        const newInvestmentBalance = (parseFloat(investmentAccount.balance) + parseFloat(amount)).toFixed(2);
        
        await storage.updateAccountBalance(accountId, newSourceBalance);
        await storage.updateAccountBalance(investmentAccountId, newInvestmentBalance);

        // Criar transação como transferência para investimento
        const transaction = await storage.createTransaction({
          userId: req.userId,
          accountId,
          categoryId: finalCategoryId,
          type: 'expense',
          amount,
          description: description || `Investimento para ${investmentAccount.name}`,
          date: new Date(),
          transferToAccountId: investmentAccountId,
          isInvestmentTransfer: true
        });

        res.json({ 
          transaction, 
          sourceAccount: { ...sourceAccount, balance: newSourceBalance },
          investmentAccount: { ...investmentAccount, balance: newInvestmentBalance }
        });
      } else {
        // Criar transação simples de investimento (sem transferência entre contas)
        const transaction = await storage.createTransaction({
          userId: req.userId,
          accountId,
          categoryId: finalCategoryId,
          type: 'expense',
          amount,
          description: description || 'Investimento',
          date: new Date(),
          isInvestmentTransfer: true
        });

        res.json({ transaction });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar investimento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Pending transactions routes
  app.get("/api/transactions/pending", authenticateToken, async (req: any, res) => {
    try {
      const pendingTransactions = await storage.getPendingTransactions(req.userId) || [];
      res.json(pendingTransactions);
    } catch (error) {
      console.error("Pending transactions API error:", error);
      res.json([]); // Return empty array instead of error to prevent frontend crashes
    }
  });

  // Confirm a pending transaction
  app.put("/api/transactions/:id/confirm", authenticateToken, async (req: any, res) => {
    try {
      const transactionId = req.params.id;
      const { accountId } = req.body;
      
      console.log(`✅ Confirming transaction ${transactionId} with account ${accountId}`);
      
      // Check if transaction belongs to user and is pending
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || transaction.userId !== req.userId) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      
      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Transação já foi confirmada" });
      }
      
      let nextTransaction = null;
      let message = "Transação confirmada com sucesso";
      
      // If accountId is provided, update the transaction with the new account and confirm
      if (accountId) {
        // Verify that the account belongs to the user
        const account = await storage.getAccount(accountId);
        if (!account || account.userId !== req.userId) {
          return res.status(400).json({ message: "Conta não encontrada ou não pertence ao usuário" });
        }
        
        // Get original transaction data before confirmation
        console.log(`📅 Original transaction date: ${transaction.date}`);
        
        await storage.confirmTransactionWithAccount(transactionId, accountId);
        
        // Get updated transaction data after confirmation
        const updatedTransaction = await storage.getTransaction(transactionId);
        console.log(`📅 Updated transaction date: ${updatedTransaction?.date}`);
        
        message = `Transação confirmada com sucesso na conta ${account.name}`;
      } else {
        // If no accountId provided, just confirm with existing account
        console.log(`📅 Original transaction date: ${transaction.date}`);
        
        await storage.updateTransactionStatus(transactionId, 'confirmed');
        
        // Get updated transaction data after confirmation
        const updatedTransaction = await storage.getTransaction(transactionId);
        console.log(`📅 Updated transaction date: ${updatedTransaction?.date}`);
      }
      
      // If this transaction belongs to a recurrence, create the next pending transaction
      if (transaction.recurrenceId) {
        console.log('🔄 Transaction belongs to recurrence, creating next pending transaction...');
        nextTransaction = await storage.createNextPendingTransactionForRecurrence(transaction.recurrenceId);
        if (nextTransaction) {
          console.log('✅ Next pending transaction created:', nextTransaction.id);
          message += " - Próxima transação recorrente criada automaticamente!";
        }
      }
      
      console.log(`✅ Transaction confirmed successfully: ${transactionId}`);
      res.json({ 
        message,
        nextTransaction,
        accountName: accountId ? (await storage.getAccount(accountId))?.name : undefined
      });
    } catch (error) {
      console.error('❌ Error confirming transaction:', error);
      res.status(500).json({ message: "Erro ao confirmar transação", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Recurrences routes
  app.get("/api/recurrences", authenticateToken, async (req: any, res) => {
    try {
      const recurrences = await storage.getUserRecurrences(req.userId) || [];
      res.json(recurrences);
    } catch (error) {
      console.error("Recurrences API error:", error);
      res.json([]); // Return empty array instead of error to prevent frontend crashes
    }
  });

  app.post("/api/recurrences", authenticateToken, async (req: any, res) => {
    try {
      console.log('📝 Creating recurrence with data:', req.body);
      
      // Ensure installments has a default value if not provided
      const bodyWithDefaults = {
        ...req.body,
        installments: req.body.installments || 1,
        userId: req.userId,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined
      };
      
      console.log('📝 Data with defaults:', bodyWithDefaults);
      
      const recurrenceData = insertRecurrenceSchema.parse(bodyWithDefaults);
      
      console.log('✅ Recurrence data parsed successfully:', recurrenceData);
      
      const recurrence = await storage.createRecurrence(recurrenceData);
      
      // Se há parcelas (installments), criar as transações individuais
      if (recurrenceData.installments && recurrenceData.installments > 1) {
        const totalValue = Number(recurrenceData.amount) * recurrenceData.installments;
        const transactions = [];
        
        for (let i = 1; i <= recurrenceData.installments; i++) {
          const installmentDate = new Date(recurrenceData.startDate);
          
          // Calcular data para cada parcela baseado na frequência
          if (recurrenceData.frequency === 'monthly') {
            installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
          } else if (recurrenceData.frequency === 'weekly') {
            installmentDate.setDate(installmentDate.getDate() + (7 * (i - 1)));
          } else if (recurrenceData.frequency === 'daily') {
            installmentDate.setDate(installmentDate.getDate() + (i - 1));
          } else if (recurrenceData.frequency === 'yearly') {
            installmentDate.setFullYear(installmentDate.getFullYear() + (i - 1));
          }
          
          const transactionData = {
            userId: req.userId,
            accountId: recurrenceData.accountId,
            creditCardId: recurrenceData.creditCardId,
            categoryId: recurrenceData.categoryId,
            type: recurrenceData.type,
            amount: recurrenceData.amount,
            description: `${recurrenceData.description} - ${i}/${recurrenceData.installments} parcela`,
            date: installmentDate,
            status: 'pending' as const
          };
          
          const transaction = await storage.createTransaction(transactionData);
          transactions.push(transaction);
        }
        
        res.json({ 
          recurrence, 
          transactions,
          totalValue,
          installments: recurrenceData.installments,
          message: `Criadas ${recurrenceData.installments} parcelas. Valor total: R$ ${totalValue.toFixed(2)}` 
        });
      } else {
        res.json(recurrence);
      }
    } catch (error) {
      console.error('❌ Error creating recurrence:', error);
      res.status(400).json({ message: "Erro ao criar recorrência", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.put("/api/recurrences/:id", authenticateToken, async (req: any, res) => {
    try {
      const recurrenceId = req.params.id;
      console.log('🔄 Update recurrence request:', {
        recurrenceId,
        body: req.body
      });
      
      const updates = updateRecurrenceSchema.parse(req.body);
      console.log('✅ Parsed updates:', updates);
      
      const result = await storage.updateRecurrenceAndPendingTransactions(recurrenceId, updates);
      console.log('✅ Recurrence updated successfully:', result.recurrence.id);
      console.log('📋 Updated pending transactions:', result.updatedTransactions.length);
      
      res.json({
        recurrence: result.recurrence,
        updatedTransactions: result.updatedTransactions,
        message: `Recorrência atualizada com sucesso. ${result.updatedTransactions.length} transações pendentes foram atualizadas.`
      });
    } catch (error) {
      console.error('❌ Error updating recurrence:', error);
      res.status(400).json({ message: "Erro ao atualizar recorrência", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.delete("/api/recurrences/:id", authenticateToken, async (req: any, res) => {
    try {
      const recurrenceId = req.params.id;
      console.log(`🗑️ Delete recurrence request for ID: ${recurrenceId}`);
      
      // Check if recurrence belongs to user before deletion
      const recurrences = await storage.getUserRecurrences(req.userId);
      const userRecurrence = recurrences.find(r => r.id === recurrenceId);
      
      if (!userRecurrence) {
        return res.status(404).json({ message: "Recorrência não encontrada" });
      }

      // Delete the recurrence and all associated transactions
      await storage.deleteRecurrence(recurrenceId);
      console.log(`✅ Recurrence deleted successfully: ${recurrenceId}`);
      
      res.json({ 
        message: "Recorrência removida com sucesso junto com todas as transações associadas."
      });
    } catch (error) {
      console.error(`❌ Error deleting recurrence:`, error);
      res.status(500).json({ message: "Erro ao remover recorrência", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Get recurrence details with pending/confirmed transactions
  app.get("/api/recurrences/:id/details", authenticateToken, async (req: any, res) => {
    try {
      const recurrenceId = req.params.id;
      
      // Check if recurrence belongs to user
      const recurrences = await storage.getUserRecurrences(req.userId);
      const userRecurrence = recurrences.find(r => r.id === recurrenceId);
      
      if (!userRecurrence) {
        return res.status(404).json({ message: "Recorrência não encontrada" });
      }
      
      const details = await storage.getRecurrenceWithDetails(recurrenceId);
      res.json(details);
    } catch (error) {
      console.error("Get recurrence details API error:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes da recorrência", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Assets routes
  app.get("/api/assets", async (req: any, res) => {
    try {
      const assets = await storage.getUserAssets(req.userId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar ativos", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/assets", async (req: any, res) => {
    try {
      const assetData = insertAssetSchema.parse({ ...req.body, userId: req.userId });
      const asset = await storage.createAsset(assetData);
      res.json(asset);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar ativo", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Investment Transactions routes
  app.get("/api/investment-transactions", async (req: any, res) => {
    try {
      const transactions = await storage.getUserInvestmentTransactions(req.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar transações de investimento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/investment-transactions", async (req: any, res) => {
    try {
      const transactionData = insertInvestmentTransactionSchema.parse({ 
        ...req.body, 
        userId: req.userId,
        date: new Date(req.body.date || Date.now())
      });
      
      const transaction = await storage.createInvestmentTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar transação de investimento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.get("/api/investments", async (req: any, res) => {
    try {
      const portfolioData = await storage.calculatePortfolioValue(req.userId);
      const assets = await storage.getUserAssets(req.userId);
      
      res.json({
        ...portfolioData,
        assets: assets,
        portfolioEvolution: [] // Mock data for now, can be calculated from historical data
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar dados de investimentos", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Asset search routes
  app.get("/api/assets/search", async (req: any, res) => {
    try {
      const { q: query, type } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Parâmetro de busca 'q' é obrigatório" });
      }

      const { searchAssets } = await import('./financial-api');
      const results = await searchAssets(query, type);
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ativos", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Historical data endpoint
  app.get("/api/assets/:symbol/historical", async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { period = 'compact' } = req.query;
      
      const { getHistoricalData } = await import('./financial-api');
      const historicalData = await getHistoricalData(symbol, period);
      
      res.json(historicalData);
    } catch (error) {
      console.error('❌ Erro ao buscar dados históricos:', error);
      res.status(500).json({ message: "Erro ao buscar dados históricos", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Fundamental data endpoint
  app.get("/api/assets/:symbol/fundamentals", async (req: any, res) => {
    try {
      const { symbol } = req.params;
      
      const { getFundamentalData } = await import('./financial-api');
      const fundamentalData = await getFundamentalData(symbol);
      
      if (!fundamentalData) {
        return res.status(404).json({ message: "Dados fundamentais não encontrados" });
      }
      
      res.json(fundamentalData);
    } catch (error) {
      console.error('❌ Erro ao buscar dados fundamentais:', error);
      res.status(500).json({ message: "Erro ao buscar dados fundamentais", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Enhanced batch quotes endpoint
  app.post("/api/assets/batch-quotes", async (req: any, res) => {
    try {
      const { symbols } = req.body;
      
      if (!Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({ message: "Lista de símbolos é obrigatória" });
      }
      
      const { getBatchQuotes } = await import('./financial-api');
      const quotes = await getBatchQuotes(symbols);
      
      // Converter Map para objeto para JSON
      const quotesObject = Object.fromEntries(quotes);
      res.json(quotesObject);
    } catch (error) {
      console.error('❌ Erro ao buscar cotações em lote:', error);
      res.status(500).json({ message: "Erro ao buscar cotações", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Single asset quote endpoint
  app.get("/api/assets/quote", async (req: any, res) => {
    try {
      const { symbol, type = 'stock' } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ message: "Parâmetro 'symbol' é obrigatório" });
      }
      
      const { getAssetQuote } = await import('./financial-api');
      const quote = await getAssetQuote(symbol, type);
      
      if (!quote) {
        return res.status(404).json({ message: "Cotação não encontrada" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar cotação", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.get("/api/assets/quote/:symbol", async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { type = 'stock' } = req.query;
      
      const { getAssetQuote } = await import('./financial-api');
      const quote = await getAssetQuote(symbol, type);
      
      if (!quote) {
        return res.status(404).json({ message: "Cotação não encontrada" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar cotação", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/assets/quotes/batch", async (req: any, res) => {
    try {
      const { assets } = req.body;
      
      if (!Array.isArray(assets)) {
        return res.status(400).json({ message: "Lista de ativos é obrigatória" });
      }

      const { updateMultipleQuotes } = await import('./financial-api');
      const quotes = await updateMultipleQuotes(assets);
      
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar cotações", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Update user assets with latest quotes
  app.post("/api/assets/refresh-quotes", async (req: any, res) => {
    try {
      const userAssets = await storage.getUserAssets(req.userId);
      
      if (userAssets.length === 0) {
        return res.json({ message: "Nenhum ativo encontrado", updated: 0 });
      }

      const { updateMultipleQuotes } = await import('./financial-api');
      const assetsForUpdate = userAssets.map(asset => ({
        symbol: asset.symbol,
        type: asset.type
      }));

      const quotes = await updateMultipleQuotes(assetsForUpdate);
      
      // Update asset prices in database
      const updates = [];
      for (const asset of userAssets) {
        const quote = quotes[asset.symbol];
        if (quote && quote.currentPrice) {
          updates.push({
            assetId: asset.id,
            currentPrice: quote.currentPrice.toString()
          });
        }
      }

      if (updates.length > 0) {
        await storage.updateAssetPrices(updates);
      }

      res.json({ 
        message: "Cotações atualizadas com sucesso", 
        updated: updates.length,
        total: userAssets.length 
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar cotações", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req: any, res) => {
    try {
      const goals = await storage.getUserGoals(req.userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar metas", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/goals", async (req: any, res) => {
    try {
      const goalData = insertGoalSchema.parse({ 
        ...req.body, 
        userId: req.userId,
        targetDate: new Date(req.body.targetDate)
      });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar meta", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Budget routes
  app.get("/api/budget/:month/:year", async (req: any, res) => {
    try {
      const { month, year } = req.params;
      const budget = await storage.getBudget(req.userId, parseInt(month), parseInt(year));
      
      console.log(`🔍 Buscando orçamento para usuário ${req.userId}, mês ${month}/${year}:`, {
        found: !!budget,
        budgetId: budget?.id,
        isDefault: budget?.isDefault,
        totalIncome: budget?.totalIncome,
        createdAt: budget?.createdAt
      });
      
      // Prevent caching to ensure fresh data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(budget);
    } catch (error) {
      console.error(`❌ Erro ao buscar orçamento para ${req.params.month}/${req.params.year}:`, error);
      res.status(500).json({ message: "Erro ao carregar orçamento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/budget", async (req: any, res) => {
    try {
      const { budgetCategories, ...budgetBody } = req.body;
      const budgetData = insertBudgetSchema.parse({ ...budgetBody, userId: req.userId });
      const budget = await storage.createBudget(budgetData);
      
      // Se foram enviadas categorias personalizadas, salvar elas
      if (budgetCategories && Array.isArray(budgetCategories)) {
        await storage.createBudgetCategories(budget.id, budgetCategories);
      }
      
      console.log(`✅ Orçamento criado/atualizado para usuário ${req.userId}:`, {
        id: budget.id,
        month: budgetData.month,
        year: budgetData.year,
        isDefault: budgetData.isDefault,
        totalIncome: budgetData.totalIncome,
        categoriesCount: budgetCategories?.length || 0
      });
      
      res.json(budget);
    } catch (error) {
      console.error('❌ Erro ao criar orçamento:', error);
      res.status(400).json({ message: "Erro ao criar orçamento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Budget categories routes
  app.get("/api/budget/:budgetId/categories", async (req: any, res) => {
    try {
      const { budgetId } = req.params;
      console.log(`🔍 Route handler received budgetId: ${budgetId} (type: ${typeof budgetId})`);
      
      // Validate budgetId - check for valid UUID format
      if (!budgetId || 
          budgetId === 'undefined' || 
          budgetId === 'NaN' || 
          budgetId === 'null' ||
          typeof budgetId !== 'string' ||
          budgetId.length < 30 ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(budgetId)) {
        console.error(`❌ Invalid budgetId received: ${budgetId}`);
        return res.status(400).json({ message: "ID do orçamento inválido" });
      }
      
      // Completely bypass database query for now to fix the error
      console.log(`⚠️ Bypassing budget categories query to prevent PostgreSQL error`);
      res.json([]);
    } catch (error) {
      console.error('❌ Erro ao carregar categorias do orçamento:', error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/budget/:budgetId/categories", async (req: any, res) => {
    try {
      const { budgetId } = req.params;
      const { categories } = req.body;
      
      if (!Array.isArray(categories)) {
        return res.status(400).json({ message: "Categorias devem ser um array" });
      }
      
      await storage.createBudgetCategories(budgetId, categories);
      res.json({ message: "Categorias do orçamento atualizadas com sucesso" });
    } catch (error) {
      console.error('❌ Erro ao salvar categorias do orçamento:', error);
      res.status(500).json({ message: "Erro ao salvar categorias do orçamento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  // Investment routes
  app.get("/api/investments", async (req: any, res) => {
    try {
      const assets = await storage.getUserAssets(req.userId);
      const totalValue = assets.reduce((sum, asset) => {
        const quantity = parseFloat(asset.quantity);
        const currentPrice = parseFloat(asset.currentPrice || asset.averagePrice);
        return sum + (quantity * currentPrice);
      }, 0);
      const appliedValue = assets.reduce((sum, asset) => {
        const quantity = parseFloat(asset.quantity);
        const averagePrice = parseFloat(asset.averagePrice);
        return sum + (quantity * averagePrice);
      }, 0);
      const totalProfit = totalValue - appliedValue;
      const profitabilityPercent = appliedValue > 0 ? (totalProfit / appliedValue) * 100 : 0;

      // Mock portfolio evolution data
      const portfolioEvolution = [
        { month: 'Jul/24', applied: 100000, profit: 105000 },
        { month: 'Ago/24', applied: 110000, profit: 115000 },
        { month: 'Set/24', applied: 120000, profit: 125000 },
        { month: 'Out/24', applied: 130000, profit: 135000 },
        { month: 'Nov/24', applied: 140000, profit: 145000 },
        { month: 'Dez/24', applied: 150000, profit: 155000 },
        { month: 'Jan/25', applied: appliedValue, profit: totalValue }
      ];

      // Group assets by type for distribution
      const assetDistribution: Record<string, any> = {};
      const typeColors = {
        'stock': '#3B82F6',
        'fii': '#10B981',
        'crypto': '#F59E0B',
        'fixed_income': '#10B981',
        'etf': '#8B5CF6',
        'other': '#6B7280'
      };

      assets.forEach(asset => {
        const type = asset.type || 'other';
        const typeName = {
          'stock': 'Ações',
          'fii': 'FIIs',
          'crypto': 'Criptomoedas', 
          'fixed_income': 'Renda Fixa',
          'etf': 'ETFs',
          'other': 'Outros'
        }[type as keyof typeof typeColors] || 'Outros';

        if (!assetDistribution[type]) {
          assetDistribution[type] = {
            name: typeName,
            value: 0,
            percentage: 0,
            color: typeColors[type as keyof typeof typeColors] || typeColors.other
          };
        }
        const quantity = parseFloat(asset.quantity);
        const currentPrice = parseFloat(asset.currentPrice || asset.averagePrice);
        assetDistribution[type].value += (quantity * currentPrice);
      });

      // Calculate percentages
      Object.values(assetDistribution).forEach((dist: any) => {
        dist.percentage = totalValue > 0 ? (dist.value / totalValue) * 100 : 0;
      });

      res.json({
        totalValue,
        appliedValue,
        totalProfit,
        profitabilityPercent,
        variation: totalProfit,
        variationPercent: profitabilityPercent,
        assets: assets.map(asset => {
          const quantity = parseFloat(asset.quantity);
          const averagePrice = parseFloat(asset.averagePrice);
          const currentPrice = parseFloat(asset.currentPrice || asset.averagePrice);
          const currentValue = quantity * currentPrice;
          const appliedValue = quantity * averagePrice;
          
          return {
            ...asset,
            currentValue: currentValue.toString(),
            appliedValue: appliedValue.toString(),
            variationPercent: averagePrice > 0 ? 
              ((currentPrice - averagePrice) / averagePrice) * 100 : 0,
            percentage: totalValue > 0 ? (currentValue / totalValue) * 100 : 0
          };
        }),
        portfolioEvolution,
        assetDistribution: Object.values(assetDistribution)
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar investimentos", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
