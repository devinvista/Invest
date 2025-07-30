import { 
  users, accounts, creditCards, categories, transactions, assets, goals, budgets, budgetCategories, investmentTransactions,
  type User, type InsertUser, type Account, type InsertAccount, 
  type CreditCard, type InsertCreditCard, type Category, type InsertCategory,
  type Transaction, type InsertTransaction, type Asset, type InsertAsset,
  type Goal, type InsertGoal, type Budget, type InsertBudget,
  type BudgetCategory, type InsertBudgetCategory, type InvestmentTransaction, type InsertInvestmentTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sum, sql } from "drizzle-orm";

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

  // Investment Transactions
  getUserInvestmentTransactions(userId: string): Promise<(InvestmentTransaction & { asset: Asset; account: Account })[]>;
  createInvestmentTransaction(investmentTransaction: InsertInvestmentTransaction): Promise<InvestmentTransaction>;
  getAssetTransactions(assetId: string): Promise<InvestmentTransaction[]>;
  
  // Investment Portfolio Calculations
  calculatePortfolioValue(userId: string): Promise<{
    totalValue: number;
    appliedValue: number;
    totalProfit: number;
    profitabilityPercent: number;
    variation: number;
    variationPercent: number;
    assetDistribution: Array<{
      name: string;
      value: number;
      percentage: number;
      color: string;
    }>;
  }>;
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
    
    // Find the most recent default budget that applies to the requested month
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
      
      // Default budget applies to months equal or later than its creation month
      // For months before creation: use older default budget (if exists) or no budget
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
    console.log(`🔍 Buscando categorias do orçamento para budgetId: ${budgetId} (type: ${typeof budgetId})`);
    
    // Validate budgetId before query - check for valid UUID format
    if (!budgetId || 
        budgetId === 'undefined' || 
        budgetId === 'NaN' || 
        budgetId === 'null' ||
        typeof budgetId !== 'string' ||
        budgetId.length < 30 ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(budgetId)) {
      console.error(`❌ Invalid budgetId format: ${budgetId} (type: ${typeof budgetId}, length: ${budgetId?.length})`);
      return [];
    }
    
    try {
      console.log(`🚀 Executando query para budget_categories com budgetId: ${budgetId}`);
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
      console.error(`❌ Query parameters: budgetId=${budgetId}, type=${typeof budgetId}`);
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

  // Investment Transactions
  async getUserInvestmentTransactions(userId: string): Promise<(InvestmentTransaction & { asset: Asset; account: Account })[]> {
    return await db
      .select()
      .from(investmentTransactions)
      .leftJoin(assets, eq(investmentTransactions.assetId, assets.id))
      .leftJoin(accounts, eq(investmentTransactions.accountId, accounts.id))
      .where(eq(investmentTransactions.userId, userId))
      .orderBy(desc(investmentTransactions.date))
      .then(rows => 
        rows.map(row => ({
          ...row.investment_transactions,
          asset: row.assets!,
          account: row.accounts!,
        }))
      );
  }

  async createInvestmentTransaction(investmentTransaction: InsertInvestmentTransaction): Promise<InvestmentTransaction> {
    // Calculate total amount if not provided
    const totalAmount = investmentTransaction.totalAmount || 
      (Number(investmentTransaction.quantity) * Number(investmentTransaction.price) + Number(investmentTransaction.fees || 0)).toString();

    const [created] = await db
      .insert(investmentTransactions)
      .values({
        ...investmentTransaction,
        totalAmount,
      })
      .returning();

    // Update account balance
    if (investmentTransaction.operation === 'buy') {
      // Subtract from account balance
      await db
        .update(accounts)
        .set({
          balance: sql`balance - ${totalAmount}::decimal`
        })
        .where(eq(accounts.id, investmentTransaction.accountId));
    } else if (investmentTransaction.operation === 'sell') {
      // Add to account balance
      await db
        .update(accounts)
        .set({
          balance: sql`balance + ${totalAmount}::decimal`
        })
        .where(eq(accounts.id, investmentTransaction.accountId));
    }

    // Update asset quantity and average price
    await this.updateAssetAfterTransaction(investmentTransaction.assetId, investmentTransaction.operation, 
      Number(investmentTransaction.quantity), Number(investmentTransaction.price));

    return created;
  }

  async getAssetTransactions(assetId: string): Promise<InvestmentTransaction[]> {
    return await db
      .select()
      .from(investmentTransactions)
      .where(eq(investmentTransactions.assetId, assetId))
      .orderBy(desc(investmentTransactions.date));
  }

  private async updateAssetAfterTransaction(assetId: string, operation: 'buy' | 'sell', quantity: number, price: number): Promise<void> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));
    if (!asset) return;

    const currentQuantity = Number(asset.quantity);
    const currentAveragePrice = Number(asset.averagePrice);

    if (operation === 'buy') {
      // Calculate new quantity and average price
      const newQuantity = currentQuantity + quantity;
      const totalValue = (currentQuantity * currentAveragePrice) + (quantity * price);
      const newAveragePrice = totalValue / newQuantity;

      await db
        .update(assets)
        .set({
          quantity: newQuantity.toString(),
          averagePrice: newAveragePrice.toFixed(2),
        })
        .where(eq(assets.id, assetId));
    } else if (operation === 'sell') {
      // Just update quantity (keep same average price)
      const newQuantity = Math.max(0, currentQuantity - quantity);
      
      await db
        .update(assets)
        .set({
          quantity: newQuantity.toString(),
        })
        .where(eq(assets.id, assetId));
    }
  }

  // Investment Portfolio Calculations
  async calculatePortfolioValue(userId: string): Promise<{
    totalValue: number;
    appliedValue: number;
    totalProfit: number;
    profitabilityPercent: number;
    variation: number;
    variationPercent: number;
    assetDistribution: Array<{
      name: string;
      value: number;
      percentage: number;
      color: string;
    }>;
  }> {
    // Get all user assets with their current values
    const userAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, userId));

    // Get investment account balances
    const investmentAccounts = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.type, 'investment')));

    // Get all investment transactions for applied value calculation
    const investmentTxns = await db
      .select()
      .from(investmentTransactions)
      .where(eq(investmentTransactions.userId, userId));

    // Calculate applied value (total invested amount)
    let appliedValue = 0;
    for (const txn of investmentTxns) {
      if (txn.operation === 'buy') {
        appliedValue += Number(txn.totalAmount);
      } else if (txn.operation === 'sell') {
        appliedValue -= Number(txn.totalAmount);
      }
    }

    // Add investment account balances to total value
    const accountBalance = investmentAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Calculate current portfolio value
    let totalAssetsValue = 0;
    const assetValues: { [key: string]: number } = {};
    
    for (const asset of userAssets) {
      const currentValue = Number(asset.quantity) * Number(asset.currentPrice || asset.averagePrice);
      totalAssetsValue += currentValue;
      
      // Group by asset type for distribution
      const typeKey = this.getAssetTypeDisplayName(asset.type);
      assetValues[typeKey] = (assetValues[typeKey] || 0) + currentValue;
    }

    const totalValue = totalAssetsValue + accountBalance;
    const totalProfit = totalValue - appliedValue;
    const profitabilityPercent = appliedValue > 0 ? (totalProfit / appliedValue) * 100 : 0;

    // For variation calculation (mock daily variation for now)
    const variation = totalValue * (Math.random() * 0.06 - 0.03); // Random between -3% and +3%
    const variationPercent = totalValue > 0 ? (variation / totalValue) * 100 : 0;

    // Create asset distribution
    const assetTypeColors = {
      'Ações': '#8B5CF6',
      'Renda Fixa': '#06B6D4',
      'Criptos': '#F59E0B',
      'ETFs': '#10B981',
      'FIIs': '#EF4444',
      'Fundos': '#EC4899'
    };

    const assetDistribution = Object.entries(assetValues).map(([type, value]) => ({
      name: type,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: assetTypeColors[type as keyof typeof assetTypeColors] || '#6B7280'
    }));

    return {
      totalValue,
      appliedValue,
      totalProfit,
      profitabilityPercent,
      variation,
      variationPercent,
      assetDistribution
    };
  }

  private getAssetTypeDisplayName(type: string): string {
    const typeMap = {
      'stock': 'Ações',
      'fii': 'FIIs',
      'crypto': 'Criptos',
      'fixed_income': 'Renda Fixa',
      'etf': 'ETFs',
      'fund': 'Fundos'
    };
    return typeMap[type as keyof typeof typeMap] || 'Outros';
  }
}

export const storage = new DatabaseStorage();
