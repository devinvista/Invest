import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertAccountSchema, insertCreditCardSchema, 
  insertCategorySchema, insertTransactionSchema, insertAssetSchema,
  insertGoalSchema, insertBudgetSchema
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

      // Create default categories
      const defaultCategories = [
        { userId: user.id, name: "Alimentação", type: "necessities" as const, transactionType: "expense" as const, color: "#1565C0", icon: "fas fa-utensils" },
        { userId: user.id, name: "Moradia", type: "necessities" as const, transactionType: "expense" as const, color: "#1565C0", icon: "fas fa-home" },
        { userId: user.id, name: "Transporte", type: "necessities" as const, transactionType: "expense" as const, color: "#1565C0", icon: "fas fa-car" },
        { userId: user.id, name: "Entretenimento", type: "wants" as const, transactionType: "expense" as const, color: "#FF9800", icon: "fas fa-gamepad" },
        { userId: user.id, name: "Compras", type: "wants" as const, transactionType: "expense" as const, color: "#FF9800", icon: "fas fa-shopping-bag" },
        { userId: user.id, name: "Investimentos", type: "savings" as const, transactionType: "expense" as const, color: "#4CAF50", icon: "fas fa-chart-line" },
        { userId: user.id, name: "Poupança", type: "savings" as const, transactionType: "expense" as const, color: "#4CAF50", icon: "fas fa-piggy-bank" },
        { userId: user.id, name: "Salário", type: "savings" as const, transactionType: "income" as const, color: "#4CAF50", icon: "fas fa-money-bill" },
        { userId: user.id, name: "Transferência", type: "savings" as const, transactionType: "transfer" as const, color: "#9C27B0", icon: "fas fa-exchange-alt" },
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
        storage.getUserAccounts(userId),
        storage.getUserCreditCards(userId),
        storage.getUserTransactions(userId, 10),
        storage.getUserGoals(userId),
        storage.getBudget(userId, currentMonth, currentYear)
      ]);

      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      const totalCreditUsed = creditCards.reduce((sum, card) => sum + parseFloat(card.usedAmount), 0);
      
      const monthlyTransactions = await storage.getTransactionsByMonth(userId, currentMonth, currentYear);
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
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
      const { fromAccountId, toAccountId, amount, description } = req.body;
      
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

      // Create transfer transactions
      const transferOutData = insertTransactionSchema.parse({
        userId: req.userId,
        accountId: fromAccountId,
        categoryId: null, // We'll need a transfer category
        type: 'transfer',
        amount: amount,
        description: description || `Transferência para ${toAccount.name}`,
        date: new Date()
      });

      const transferInData = insertTransactionSchema.parse({
        userId: req.userId,
        accountId: toAccountId,
        categoryId: null, // We'll need a transfer category
        type: 'transfer',
        amount: amount,
        description: description || `Transferência de ${fromAccount.name}`,
        date: new Date()
      });

      // For now, we'll skip transaction creation as it requires categoryId
      // TODO: Create transfer category or handle transfer transactions differently
      
      res.json({ 
        message: "Transferência realizada com sucesso", 
        fromAccount: { ...fromAccount, balance: newFromBalance },
        toAccount: { ...toAccount, balance: newToBalance }
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
      let transactions;
      
      if (month && year) {
        transactions = await storage.getTransactionsByMonth(req.userId, parseInt(month), parseInt(year));
      } else {
        transactions = await storage.getUserTransactions(req.userId, limit ? parseInt(limit) : undefined);
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar transações", error: error instanceof Error ? error.message : "Erro desconhecido" });
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
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar orçamento", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });

  app.post("/api/budget", async (req: any, res) => {
    try {
      const budgetData = insertBudgetSchema.parse({ ...req.body, userId: req.userId });
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar orçamento", error: error instanceof Error ? error.message : "Erro desconhecido" });
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
