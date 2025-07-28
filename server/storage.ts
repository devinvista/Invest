import { 
  users, accounts, creditCards, categories, transactions, assets, goals, budgets,
  type User, type InsertUser, type Account, type InsertAccount, 
  type CreditCard, type InsertCreditCard, type Category, type InsertCategory,
  type Transaction, type InsertTransaction, type Asset, type InsertAsset,
  type Goal, type InsertGoal, type Budget, type InsertBudget
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
    
    // If no specific budget, try to find default budget
    const [defaultBudget] = await db.select().from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.isDefault, true)
        )
      );
    
    return defaultBudget || undefined;
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
}

export const storage = new DatabaseStorage();
