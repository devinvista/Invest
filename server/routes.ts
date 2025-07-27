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
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create default categories
      const defaultCategories = [
        { userId: user.id, name: "Alimentação", type: "necessities" as const, color: "#1565C0", icon: "fas fa-utensils" },
        { userId: user.id, name: "Moradia", type: "necessities" as const, color: "#1565C0", icon: "fas fa-home" },
        { userId: user.id, name: "Transporte", type: "necessities" as const, color: "#1565C0", icon: "fas fa-car" },
        { userId: user.id, name: "Entretenimento", type: "wants" as const, color: "#FF9800", icon: "fas fa-gamepad" },
        { userId: user.id, name: "Compras", type: "wants" as const, color: "#FF9800", icon: "fas fa-shopping-bag" },
        { userId: user.id, name: "Investimentos", type: "savings" as const, color: "#4CAF50", icon: "fas fa-chart-line" },
        { userId: user.id, name: "Poupança", type: "savings" as const, color: "#4CAF50", icon: "fas fa-piggy-bank" },
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
      const user = await storage.getUserByUsername(username);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
