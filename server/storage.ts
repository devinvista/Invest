import { 
  users, accounts, creditCards, categories, transactions, assets, goals, budgets, budgetCategories,
  type User, type InsertUser, type Account, type InsertAccount, 
  type CreditCard, type InsertCreditCard, type Category, type InsertCategory,
  type Transaction, type InsertTransaction, type Asset, type InsertAsset,
  type Goal, type InsertGoal, type Budget, type InsertBudget,
  type BudgetCategory, type InsertBudgetCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sum } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Accounts
  getUserAccounts(userId: string): Promise<Account[]>;
  getAccount(accountId: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(accountId: string, updates: Partial<InsertAccount>): Promise<Account>;
  updateAccountBalance(accountId: string, balance: string): Promise<void>;
  deleteAccount(accountId: string): Promise<void>;

  // Credit Cards
  getUserCreditCards(userId: string): Promise<CreditCard[]>;
  createCreditCard(card: InsertCreditCard): Promise<CreditCard>;
  updateCreditCardUsage(cardId: string, usedAmount: string): Promise<void>;

  // Categories
  getUserCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(categoryId: string, updates: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;

  // Transactions
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getTransactionsByMonth(userId: string, month: number, year: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Assets
  getUserAssets(userId: string): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAssetPrice(assetId: string, currentPrice: string): Promise<void>;

  // Goals
  getUserGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoalProgress(goalId: string, currentAmount: string): Promise<void>;

  // Budgets
  getBudget(userId: string, month: number, year: number): Promise<Budget | undefined>;
  getDefaultBudget(userId: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudgetSpending(budgetId: string, necessities: string, wants: string, savings: string): Promise<void>;
  
  // Budget Categories
  getBudgetCategories(budgetId: string): Promise<(BudgetCategory & { category: Category })[]>;
  createBudgetCategories(budgetId: string, categories: { categoryId: string; allocatedAmount: string }[]): Promise<void>;
  deleteBudgetCategories(budgetId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Accounts
  async getUserAccounts(userId: string): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAccount(accountId: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
    return account || undefined;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async updateAccount(accountId: string, updates: Partial<InsertAccount>): Promise<Account> {
    const [updatedAccount] = await db.update(accounts)
      .set(updates)
      .where(eq(accounts.id, accountId))
      .returning();
    return updatedAccount;
  }

  async updateAccountBalance(accountId: string, balance: string): Promise<void> {
    await db.update(accounts).set({ balance }).where(eq(accounts.id, accountId));
  }

  async deleteAccount(accountId: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, accountId));
  }

  // Credit Cards
  async getUserCreditCards(userId: string): Promise<CreditCard[]> {
    return await db.select().from(creditCards).where(eq(creditCards.userId, userId));
  }

  async createCreditCard(card: InsertCreditCard): Promise<CreditCard> {
    const [newCard] = await db.insert(creditCards).values(card).returning();
    return newCard;
  }

  async updateCreditCardUsage(cardId: string, usedAmount: string): Promise<void> {
    await db.update(creditCards).set({ usedAmount }).where(eq(creditCards.id, cardId));
  }

  // Categories
  async getUserCategories(userId: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(categoryId: string, updates: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db.update(categories)
      .set(updates)
      .where(eq(categories.id, categoryId))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, categoryId));
  }

  // Transactions
  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    let query = db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
    if (limit) {
      query = query.limit(limit) as any;
    }
    return await query;
  }

  async getTransactionsByMonth(userId: string, month: number, year: number): Promise<Transaction[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    return await db.select().from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Assets
  async getUserAssets(userId: string): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db.insert(assets).values(asset).returning();
    return newAsset;
  }

  async updateAssetPrice(assetId: string, currentPrice: string): Promise<void> {
    await db.update(assets).set({ currentPrice }).where(eq(assets.id, assetId));
  }

  // Goals
  async getUserGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoalProgress(goalId: string, currentAmount: string): Promise<void> {
    await db.update(goals).set({ currentAmount }).where(eq(goals.id, goalId));
  }

  // Budgets
  async getBudget(userId: string, month: number, year: number): Promise<Budget | undefined> {
    // First try to find specific budget for the month/year
    const [specificBudget] = await db.select().from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, month),
          eq(budgets.year, year),
          eq(budgets.isDefault, false)
        )
      );
    
    if (specificBudget) {
      return specificBudget;
    }
    
    // If no specific budget, find applicable default budget
    // Default budget applies only to months equal or later than its creation month
    const allDefaultBudgets = await db.select().from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.isDefault, true)
        )
      )
      .orderBy(desc(budgets.createdAt)); // Get most recent default budget first
    
    if (allDefaultBudgets.length === 0) {
      return undefined;
    }
    
    // Find the most recent default budget that was created before or during the requested month
    const requestedDate = new Date(year, month - 1, 1); // month - 1 because JS months are 0-based
    
    for (const defaultBudget of allDefaultBudgets) {
      const budgetCreationDate = new Date(defaultBudget.createdAt);
      const budgetCreationMonth = new Date(budgetCreationDate.getFullYear(), budgetCreationDate.getMonth(), 1);
      
      console.log(`📅 Verificando orçamento padrão temporal:`, {
        requestedMonth: `${month}/${year}`,
        budgetCreatedAt: budgetCreationDate.toISOString(),
        budgetCreationMonth: `${budgetCreationDate.getMonth() + 1}/${budgetCreationDate.getFullYear()}`,
        requestedDateCompare: requestedDate.toISOString(),
        budgetCreationCompare: budgetCreationMonth.toISOString(),
        budgetCreationBeforeOrEqual: budgetCreationMonth <= requestedDate,
        applies: budgetCreationMonth <= requestedDate
      });
      
      // Default budget applies if it was created in or before the requested month
      if (budgetCreationMonth <= requestedDate) {
        return defaultBudget;
      }
    }
    
    return undefined;
  }

  async getDefaultBudget(userId: string): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.isDefault, true)
        )
      );
    return budget || undefined;
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    // Check if budget already exists (for update scenario)
    const existingBudget = await this.getBudget(budget.userId, budget.month || 0, budget.year || 0);
    
    if (existingBudget && 
        ((budget.isDefault && existingBudget.isDefault) || 
         (!budget.isDefault && !existingBudget.isDefault && 
          existingBudget.month === budget.month && 
          existingBudget.year === budget.year))) {
      
      // Update existing budget
      const [updatedBudget] = await db.update(budgets)
        .set({
          totalIncome: budget.totalIncome,
          necessitiesBudget: budget.necessitiesBudget,
          wantsBudget: budget.wantsBudget,
          savingsBudget: budget.savingsBudget,
          isDefault: budget.isDefault,
        })
        .where(eq(budgets.id, existingBudget.id))
        .returning();
      
      return updatedBudget;
    }
    
    // Create new budget
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudgetSpending(budgetId: string, necessities: string, wants: string, savings: string): Promise<void> {
    await db.update(budgets)
      .set({ 
        necessitiesSpent: necessities,
        wantsSpent: wants,
        savingsSpent: savings
      })
      .where(eq(budgets.id, budgetId));
  }

  // Budget Categories
  async getBudgetCategories(budgetId: string): Promise<(BudgetCategory & { category: Category })[]> {
    console.log(`🔍 Buscando categorias do orçamento para budgetId: ${budgetId}`);
    
    try {
      const result = await db.select()
        .from(budgetCategories)
        .leftJoin(categories, eq(budgetCategories.categoryId, categories.id))
        .where(eq(budgetCategories.budgetId, budgetId));
      
      console.log(`✅ Encontradas ${result.length} categorias para o orçamento ${budgetId}`);
      
      return result.map(row => ({
        ...row.budget_categories,
        category: row.categories!
      }));
    } catch (error) {
      console.error(`❌ Erro ao buscar categorias do orçamento ${budgetId}:`, error);
      return [];
    }
  }

  async createBudgetCategories(budgetId: string, categoryData: { categoryId: string; allocatedAmount: string }[]): Promise<void> {
    // Primeiro, remover categorias existentes para este orçamento
    await this.deleteBudgetCategories(budgetId);
    
    // Inserir novas categorias
    if (categoryData.length > 0) {
      const budgetCategoryInserts = categoryData.map(cat => ({
        budgetId,
        categoryId: cat.categoryId,
        allocatedAmount: cat.allocatedAmount
      }));
      
      await db.insert(budgetCategories).values(budgetCategoryInserts);
    }
  }

  async deleteBudgetCategories(budgetId: string): Promise<void> {
    await db.delete(budgetCategories).where(eq(budgetCategories.budgetId, budgetId));
  }
}

export const storage = new DatabaseStorage();
