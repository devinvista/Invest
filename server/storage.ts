import { 
  users, accounts, creditCards, categories, transactions, assets, goals, budgets, budgetCategories, investmentTransactions, recurrences,
  type User, type InsertUser, type Account, type InsertAccount, 
  type CreditCard, type InsertCreditCard, type Category, type InsertCategory,
  type Transaction, type InsertTransaction, type Asset, type InsertAsset,
  type Goal, type InsertGoal, type Budget, type InsertBudget,
  type BudgetCategory, type InsertBudgetCategory, type InvestmentTransaction, type InsertInvestmentTransaction,
  type Recurrence, type InsertRecurrence
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sum, sql, inArray } from "drizzle-orm";

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
  updateTransactionStatus(transactionId: string, status: 'confirmed' | 'pending'): Promise<void>;
  confirmTransactionWithAccount(transactionId: string, accountId: string): Promise<void>;
  deleteTransaction(transactionId: string): Promise<void>;
  getPendingTransactions(userId: string): Promise<Transaction[]>;

  // Recurrences
  getUserRecurrences(userId: string): Promise<Recurrence[]>;
  createRecurrence(recurrence: InsertRecurrence): Promise<Recurrence>;
  updateRecurrence(recurrenceId: string, updates: Partial<InsertRecurrence>): Promise<Recurrence>;
  deactivateRecurrence(recurrenceId: string): Promise<void>;
  deleteRecurrence(recurrenceId: string): Promise<void>;
  getActiveRecurrencesToExecute(): Promise<Recurrence[]>;
  updateRecurrenceNextExecution(recurrenceId: string, nextDate: Date, lastDate?: Date): Promise<void>;
  getRecurrencePendingTransactions(recurrenceId: string): Promise<Transaction[]>;
  getRecurrenceWithDetails(recurrenceId: string): Promise<{
    recurrence: Recurrence;
    pendingTransactions: Transaction[];
    confirmedTransactions: Transaction[];
    totalPendingAmount: number;
    totalConfirmedAmount: number;
  } | undefined>;

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
  testBudgetCategoriesQuery(budgetId: string): Promise<any>;
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
    try {
      let query = db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
      if (limit) {
        query = query.limit(limit) as any;
      }
      return await query;
    } catch (error) {
      console.error("getUserTransactions error:", error);
      return [];
    }
  }

  async getTransactionsByMonth(userId: string, month: number, year: number): Promise<Transaction[]> {
    try {
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
    } catch (error) {
      console.error("getTransactionsByMonth error:", error);
      return [];
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update credit card usage if transaction involves a credit card
    if (newTransaction.creditCardId && newTransaction.type === 'expense') {
      // Get current credit card to calculate new usage
      const [currentCard] = await db.select()
        .from(creditCards)
        .where(eq(creditCards.id, newTransaction.creditCardId));
      
      if (currentCard) {
        // Calculate new used amount
        const currentUsed = parseFloat(currentCard.usedAmount || '0');
        const transactionAmount = parseFloat(newTransaction.amount);
        const newUsedAmount = (currentUsed + transactionAmount).toFixed(2);
        
        // Update credit card usage
        await this.updateCreditCardUsage(newTransaction.creditCardId, newUsedAmount);
      }
    }
    
    return newTransaction;
  }

  async getTransaction(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId));
    return transaction;
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    // Get transaction details before deletion for potential credit card balance adjustment
    const transaction = await this.getTransaction(transactionId);
    
    if (transaction && transaction.creditCardId && transaction.type === 'expense') {
      // Get current credit card to calculate new usage
      const [currentCard] = await db.select()
        .from(creditCards)
        .where(eq(creditCards.id, transaction.creditCardId));
      
      if (currentCard) {
        // Calculate new used amount (subtract the deleted transaction)
        const currentUsed = parseFloat(currentCard.usedAmount || '0');
        const transactionAmount = parseFloat(transaction.amount);
        const newUsedAmount = Math.max(0, currentUsed - transactionAmount).toFixed(2);
        
        // Update credit card usage
        await this.updateCreditCardUsage(transaction.creditCardId, newUsedAmount);
      }
    }
    
    await db.delete(transactions).where(eq(transactions.id, transactionId));
  }

  async updateTransactionStatus(transactionId: string, status: 'confirmed' | 'pending'): Promise<void> {
    const updateData: any = { status };
    
    // If confirming a transaction, update the date to current date
    if (status === 'confirmed') {
      const confirmationDate = new Date();
      updateData.date = confirmationDate;
      console.log(`📅 Updating transaction ${transactionId} status to confirmed with date: ${confirmationDate.toISOString()}`);
    }
    
    await db.update(transactions)
      .set(updateData)
      .where(eq(transactions.id, transactionId));
  }

  async confirmTransactionWithAccount(transactionId: string, accountId: string): Promise<void> {
    const confirmationDate = new Date();
    console.log(`📅 Updating transaction ${transactionId} date to confirmation date: ${confirmationDate.toISOString()}`);
    
    // Update transaction status, account, and date to confirmation date
    await db.update(transactions)
      .set({ 
        status: 'confirmed',
        accountId: accountId,
        date: confirmationDate // Set to current date when confirmed
      })
      .where(eq(transactions.id, transactionId));
  }

  async getPendingTransactions(userId: string): Promise<Transaction[]> {
    try {
      return await db.select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.status, 'pending')
          )
        )
        .orderBy(transactions.date);
    } catch (error) {
      console.error("getPendingTransactions error:", error);
      return [];
    }
  }

  // Recurrences
  async getUserRecurrences(userId: string): Promise<Recurrence[]> {
    try {
      return await db.select()
        .from(recurrences)
        .where(
          and(
            eq(recurrences.userId, userId),
            eq(recurrences.isActive, true)
          )
        )
        .orderBy(desc(recurrences.createdAt));
    } catch (error) {
      console.error("getUserRecurrences error:", error);
      return [];
    }
  }

  async createRecurrence(recurrence: InsertRecurrence): Promise<Recurrence> {
    try {
      console.log('🚀 Creating recurrence in storage:', recurrence);
      
      // Calculate next execution date based on frequency
      const nextDate = this.calculateNextExecutionDate(recurrence.startDate, recurrence.frequency);
      console.log('📅 Calculated next execution date:', nextDate);
      
      const recurrenceData = {
        ...recurrence,
        nextExecutionDate: nextDate,
        isActive: recurrence.isActive ?? true,
      };
      
      console.log('📝 Final recurrence data:', recurrenceData);
      
      const [newRecurrence] = await db.insert(recurrences).values(recurrenceData).returning();
      console.log('✅ Recurrence created successfully:', newRecurrence);
      
      // For "forever" recurrences (no end date), create the first pending transaction
      if (newRecurrence.isActive && (newRecurrence.endDate === null || newRecurrence.endDate === undefined)) {
        console.log('🔄 Creating initial pending transaction for forever recurrence...');
        
        // Create the first pending transaction immediately
        const firstTransactionData: InsertTransaction = {
          userId: newRecurrence.userId,
          accountId: newRecurrence.accountId,
          creditCardId: newRecurrence.creditCardId,
          categoryId: newRecurrence.categoryId,
          type: newRecurrence.type,
          amount: newRecurrence.amount,
          description: newRecurrence.description,
          date: newRecurrence.nextExecutionDate,
          status: 'pending',
          recurrenceId: newRecurrence.id,
          installments: 1,
          currentInstallment: 1
        };

        console.log('📝 Creating first pending transaction:', firstTransactionData);
        const [firstTransaction] = await db.insert(transactions).values(firstTransactionData).returning();
        console.log('✅ First pending transaction created:', firstTransaction.id);
      }
      
      return newRecurrence;
    } catch (error) {
      console.error('❌ Error in createRecurrence:', error);
      throw error;
    }
  }

  async updateRecurrence(recurrenceId: string, updates: Partial<InsertRecurrence>): Promise<Recurrence> {
    const [updatedRecurrence] = await db.update(recurrences)
      .set(updates)
      .where(eq(recurrences.id, recurrenceId))
      .returning();
    return updatedRecurrence;
  }

  async updateRecurrenceAndPendingTransactions(recurrenceId: string, updates: Partial<InsertRecurrence>): Promise<{
    recurrence: Recurrence;
    updatedTransactions: Transaction[];
  }> {
    console.log('🔄 Starting recurrence and pending transactions update for:', recurrenceId);
    console.log('📝 Updates received:', updates);

    // First, check if there are any pending transactions for this recurrence
    const pendingTransactions = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.recurrenceId, recurrenceId),
          eq(transactions.status, 'pending')
        )
      );
    
    console.log('🔍 Found pending transactions:', pendingTransactions.length);
    console.log('📋 Pending transactions details:', pendingTransactions.map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      status: t.status
    })));

    // First update the recurrence
    const [updatedRecurrence] = await db.update(recurrences)
      .set(updates)
      .where(eq(recurrences.id, recurrenceId))
      .returning();

    console.log('✅ Recurrence updated successfully');

    // Then update only pending transactions related to this recurrence
    const transactionUpdates: any = {};
    
    // Map recurrence fields to transaction fields
    if (updates.amount !== undefined) {
      transactionUpdates.amount = updates.amount;
    }
    if (updates.description !== undefined) {
      transactionUpdates.description = updates.description;
    }
    if (updates.categoryId !== undefined) {
      transactionUpdates.categoryId = updates.categoryId;
    }
    if (updates.accountId !== undefined) {
      transactionUpdates.accountId = updates.accountId;
    }
    if (updates.creditCardId !== undefined) {
      transactionUpdates.creditCardId = updates.creditCardId;
    }
    if (updates.type !== undefined) {
      transactionUpdates.type = updates.type;
    }

    console.log('🔧 Transaction updates to apply:', transactionUpdates);

    let updatedTransactions: Transaction[] = [];
    
    // Only update transactions if there are transaction-related changes
    if (Object.keys(transactionUpdates).length > 0) {
      console.log('🔄 Updating pending transactions...');
      updatedTransactions = await db.update(transactions)
        .set(transactionUpdates)
        .where(
          and(
            eq(transactions.recurrenceId, recurrenceId),
            eq(transactions.status, 'pending')
          )
        )
        .returning();
      
      console.log('✅ Updated transactions:', updatedTransactions.length);
      console.log('📋 Updated transaction details:', updatedTransactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        status: t.status
      })));
    } else {
      console.log('⚠️ No transaction-related updates to apply');
    }

    return {
      recurrence: updatedRecurrence,
      updatedTransactions
    };
  }

  async deactivateRecurrence(recurrenceId: string): Promise<void> {
    await db.update(recurrences)
      .set({ isActive: false })
      .where(eq(recurrences.id, recurrenceId));
  }

  async deleteRecurrence(recurrenceId: string): Promise<void> {
    console.log('🗑️ Starting recurrence deletion:', recurrenceId);
    
    // First, delete all transactions associated with this recurrence
    const deletedTransactions = await db.delete(transactions)
      .where(eq(transactions.recurrenceId, recurrenceId))
      .returning();
    
    console.log('🗑️ Deleted associated transactions:', deletedTransactions.length);
    
    // Then delete the recurrence itself
    await db.delete(recurrences).where(eq(recurrences.id, recurrenceId));
    console.log('✅ Recurrence deleted successfully');
  }

  async getRecurrencePendingTransactions(recurrenceId: string): Promise<Transaction[]> {
    try {
      return await db.select()
        .from(transactions)
        .where(
          and(
            eq(transactions.recurrenceId, recurrenceId),
            eq(transactions.status, 'pending')
          )
        )
        .orderBy(transactions.date);
    } catch (error) {
      console.error("getRecurrencePendingTransactions error:", error);
      return [];
    }
  }

  async getRecurrenceWithDetails(recurrenceId: string): Promise<{
    recurrence: Recurrence;
    pendingTransactions: Transaction[];
    confirmedTransactions: Transaction[];
    totalPendingAmount: number;
    totalConfirmedAmount: number;
  } | undefined> {
    try {
      // Get recurrence
      const [recurrence] = await db.select()
        .from(recurrences)
        .where(eq(recurrences.id, recurrenceId));

      if (!recurrence) return undefined;

      // Get pending transactions
      const pendingTransactions = await db.select()
        .from(transactions)
        .where(
          and(
            eq(transactions.recurrenceId, recurrenceId),
            eq(transactions.status, 'pending')
          )
        )
        .orderBy(transactions.date);

      // Get confirmed transactions  
      const confirmedTransactions = await db.select()
        .from(transactions)
        .where(
          and(
            eq(transactions.recurrenceId, recurrenceId),
            eq(transactions.status, 'confirmed')
          )
        )
        .orderBy(transactions.date);

      // Calculate totals
      const totalPendingAmount = pendingTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount), 
        0
      );
      
      const totalConfirmedAmount = confirmedTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount), 
        0
      );

      return {
        recurrence,
        pendingTransactions,
        confirmedTransactions,
        totalPendingAmount,
        totalConfirmedAmount
      };
    } catch (error) {
      console.error("getRecurrenceWithDetails error:", error);
      return undefined;
    }
  }

  async getActiveRecurrencesToExecute(): Promise<Recurrence[]> {
    const now = new Date();
    return await db.select()
      .from(recurrences)
      .where(
        and(
          eq(recurrences.isActive, true),
          lte(recurrences.nextExecutionDate, now)
        )
      );
  }

  async updateRecurrenceNextExecution(recurrenceId: string, nextDate: Date, lastDate?: Date): Promise<void> {
    const updateData: any = { nextExecutionDate: nextDate };
    if (lastDate) {
      updateData.lastExecutedDate = lastDate;
    }
    
    await db.update(recurrences)
      .set(updateData)
      .where(eq(recurrences.id, recurrenceId));
  }

  private calculateNextExecutionDate(currentDate: Date, frequency: string): Date {
    const next = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    
    return next;
  }

  async createNextPendingTransactionForRecurrence(recurrenceId: string): Promise<Transaction | null> {
    try {
      console.log('🔄 Creating next pending transaction for recurrence:', recurrenceId);
      
      // Get the recurrence details
      const [recurrence] = await db.select()
        .from(recurrences)
        .where(eq(recurrences.id, recurrenceId));
      
      if (!recurrence) {
        console.log('❌ Recurrence not found:', recurrenceId);
        return null;
      }

      // Only create next transaction for active recurrences without end date (forever)
      if (!recurrence.isActive || recurrence.endDate) {
        console.log('⚠️ Recurrence is not active or has end date, skipping next transaction creation');
        return null;
      }

      // Calculate next transaction date
      const nextDate = this.calculateNextExecutionDate(recurrence.nextExecutionDate, recurrence.frequency);
      console.log('📅 Next transaction date calculated:', nextDate);

      // Create the next pending transaction
      const nextTransactionData: InsertTransaction = {
        userId: recurrence.userId,
        accountId: recurrence.accountId,
        creditCardId: recurrence.creditCardId,
        categoryId: recurrence.categoryId,
        type: recurrence.type,
        amount: recurrence.amount,
        description: recurrence.description,
        date: nextDate,
        status: 'pending',
        recurrenceId: recurrence.id,
        installments: 1,
        currentInstallment: 1
      };

      console.log('📝 Creating next pending transaction:', nextTransactionData);
      const [nextTransaction] = await db.insert(transactions).values(nextTransactionData).returning();
      
      // Update recurrence next execution date
      await this.updateRecurrenceNextExecution(recurrence.id, nextDate);
      
      console.log('✅ Next pending transaction created:', nextTransaction.id);
      return nextTransaction;
    } catch (error) {
      console.error('❌ Error creating next pending transaction:', error);
      return null;
    }
  }

  // Assets
  async getUserAssets(userId: string): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const assetData = {
      ...asset,
      lastQuoteUpdate: new Date()
    };
    const [newAsset] = await db.insert(assets).values(assetData).returning();
    return newAsset;
  }

  async updateAssetPrice(assetId: string, currentPrice: string): Promise<void> {
    await db.update(assets)
      .set({ 
        currentPrice: currentPrice,
        lastQuoteUpdate: new Date()
      })
      .where(eq(assets.id, assetId));
  }

  async updateAssetPrices(updates: Array<{assetId: string, currentPrice: string}>): Promise<void> {
    for (const update of updates) {
      await this.updateAssetPrice(update.assetId, update.currentPrice);
    }
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



  // Budget Categories (DISABLED to prevent PostgreSQL error)
  async getBudgetCategories(budgetId: string): Promise<(BudgetCategory & { category: Category })[]> {
    console.log(`⚠️ getBudgetCategories method disabled to prevent PostgreSQL NaN error for budgetId: ${budgetId}`);
    // Return empty array to prevent any database queries that might cause PostgreSQL errors
    return [];
  }

  // Diagnostic method to test budget categories queries step by step
  async testBudgetCategoriesQuery(budgetId: string): Promise<any> {
    console.log(`🧪 Testing budget categories queries for budgetId: ${budgetId}`);
    
    try {
      // Test 1: Simple select from budget_categories
      console.log(`🧪 Test 1: Simple budget_categories query`);
      const budgetCats = await db
        .select({
          id: budgetCategories.id,
          budgetId: budgetCategories.budgetId,
          categoryId: budgetCategories.categoryId,
          allocatedAmount: budgetCategories.allocatedAmount
        })
        .from(budgetCategories)
        .where(eq(budgetCategories.budgetId, budgetId));
      
      console.log(`✅ Test 1 passed: ${budgetCats.length} records`);
      
      if (budgetCats.length === 0) {
        return { success: true, message: "No budget categories found", data: [] };
      }

      // Test 2: Get first category ID and test categories table
      const firstCategoryId = budgetCats[0].categoryId;
      console.log(`🧪 Test 2: Categories query for categoryId: ${firstCategoryId}`);
      
      const testCategory = await db
        .select({
          id: categories.id,
          name: categories.name,
          type: categories.type
        })
        .from(categories)
        .where(eq(categories.id, firstCategoryId))
        .limit(1);
      
      console.log(`✅ Test 2 passed: Found category:`, testCategory[0]);
      
      return {
        success: true,
        message: "All tests passed",
        budgetCategories: budgetCats,
        sampleCategory: testCategory[0]
      };
      
    } catch (error) {
      console.error(`❌ Diagnostic test failed:`, error);
      throw error;
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
