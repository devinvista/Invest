import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense', 'transfer']);
export const categoryTypeEnum = pgEnum('category_type', ['necessities', 'wants', 'savings']);
export const accountTypeEnum = pgEnum('account_type', ['checking', 'savings', 'investment']);
export const assetTypeEnum = pgEnum('asset_type', ['stock', 'fii', 'crypto', 'fixed_income', 'etf', 'fund']);
export const investmentOperationEnum = pgEnum('investment_operation', ['buy', 'sell']);
export const goalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'paused']);
export const transactionStatusEnum = pgEnum('transaction_status', ['confirmed', 'pending']);
export const recurrenceFrequencyEnum = pgEnum('recurrence_frequency', ['daily', 'weekly', 'monthly', 'yearly']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Accounts table
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  bankName: text("bank_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Credit Cards table
export const creditCards = pgTable("credit_cards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  limit: decimal("limit", { precision: 12, scale: 2 }).notNull(),
  usedAmount: decimal("used_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  closingDay: integer("closing_day").notNull(),
  dueDay: integer("due_day").notNull(),
  bankName: text("bank_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: categoryTypeEnum("type"), // necessities, wants, savings (null for income)
  transactionType: transactionTypeEnum("transaction_type").notNull(), // income, expense, transfer
  color: text("color").default("#1565C0"),
  icon: text("icon").default("Circle"),
  isDefault: boolean("is_default").default(false).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  accountId: uuid("account_id").references(() => accounts.id),
  creditCardId: uuid("credit_card_id").references(() => creditCards.id),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  status: transactionStatusEnum("status").default("confirmed").notNull(), // Status da transação
  installments: integer("installments").default(1),
  currentInstallment: integer("current_installment").default(1),
  // Campos para controle de transferências para investimento
  transferToAccountId: uuid("transfer_to_account_id").references(() => accounts.id), // Conta de destino se for transferência
  isInvestmentTransfer: boolean("is_investment_transfer").default(false).notNull(), // Se é transferência para investimento
  // Campos para recorrência
  recurrenceId: uuid("recurrence_id").references(() => recurrences.id), // Link para recorrência
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recurrences table - for recurring transactions
export const recurrences = pgTable("recurrences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  accountId: uuid("account_id").references(() => accounts.id),
  creditCardId: uuid("credit_card_id").references(() => creditCards.id),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  frequency: recurrenceFrequencyEnum("frequency").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // Opcional, se null = recorrência infinita
  isActive: boolean("is_active").default(true).notNull(),
  installments: integer("installments").default(1),
  nextExecutionDate: timestamp("next_execution_date").notNull(), // Próxima data de execução
  lastExecutedDate: timestamp("last_executed_date"), // Última vez que foi executada
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assets table
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  type: assetTypeEnum("type").notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 8 }).notNull(),
  averagePrice: decimal("average_price", { precision: 12, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 12, scale: 2 }).default("0.00"),
  sector: text("sector"),
  // Enhanced metadata for API integration
  exchange: text("exchange"), // B3, NYSE, NASDAQ, etc.
  currency: text("currency").default("BRL"), // BRL, USD, EUR, etc.
  coinGeckoId: text("coingecko_id"), // For crypto assets
  region: text("region"), // Brazil, United States, etc.
  lastQuoteUpdate: timestamp("last_quote_update"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Goals table
export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  targetDate: timestamp("target_date").notNull(),
  status: goalStatusEnum("status").default("active").notNull(),
  monthlyContribution: decimal("monthly_contribution", { precision: 12, scale: 2 }).default("0.00"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Budgets table
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  isDefault: boolean("is_default").default(false).notNull(), // Orçamento padrão para todos os meses
  totalIncome: decimal("total_income", { precision: 12, scale: 2 }).notNull(),
  necessitiesBudget: decimal("necessities_budget", { precision: 12, scale: 2 }).notNull(),
  wantsBudget: decimal("wants_budget", { precision: 12, scale: 2 }).notNull(),
  savingsBudget: decimal("savings_budget", { precision: 12, scale: 2 }).notNull(),
  necessitiesSpent: decimal("necessities_spent", { precision: 12, scale: 2 }).default("0.00"),
  wantsSpent: decimal("wants_spent", { precision: 12, scale: 2 }).default("0.00"),
  savingsSpent: decimal("savings_spent", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Budget Categories - for individual category budget allocation
export const budgetCategories = pgTable("budget_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  budgetId: uuid("budget_id").references(() => budgets.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  allocatedAmount: decimal("allocated_amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Investment Transactions - for tracking investment operations
export const investmentTransactions = pgTable("investment_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  accountId: uuid("account_id").references(() => accounts.id).notNull(), // Account from which the investment was made
  operation: investmentOperationEnum("operation").notNull(), // buy or sell
  quantity: decimal("quantity", { precision: 12, scale: 8 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(), // quantity * price
  fees: decimal("fees", { precision: 12, scale: 2 }).default("0.00"),
  date: timestamp("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  creditCards: many(creditCards),
  categories: many(categories),
  transactions: many(transactions),
  recurrences: many(recurrences),
  assets: many(assets),
  goals: many(goals),
  budgets: many(budgets),
  budgetCategories: many(budgetCategories),
  investmentTransactions: many(investmentTransactions),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const creditCardsRelations = relations(creditCards, ({ one, many }) => ({
  user: one(users, { fields: [creditCards.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  creditCard: one(creditCards, { fields: [transactions.creditCardId], references: [creditCards.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
  recurrence: one(recurrences, { fields: [transactions.recurrenceId], references: [recurrences.id] }),
}));

export const recurrencesRelations = relations(recurrences, ({ one, many }) => ({
  user: one(users, { fields: [recurrences.userId], references: [users.id] }),
  account: one(accounts, { fields: [recurrences.accountId], references: [accounts.id] }),
  creditCard: one(creditCards, { fields: [recurrences.creditCardId], references: [creditCards.id] }),
  category: one(categories, { fields: [recurrences.categoryId], references: [categories.id] }),
  transactions: many(transactions),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  user: one(users, { fields: [assets.userId], references: [users.id] }),
  investmentTransactions: many(investmentTransactions),
}));

export const investmentTransactionsRelations = relations(investmentTransactions, ({ one }) => ({
  user: one(users, { fields: [investmentTransactions.userId], references: [users.id] }),
  asset: one(assets, { fields: [investmentTransactions.assetId], references: [assets.id] }),
  account: one(accounts, { fields: [investmentTransactions.accountId], references: [accounts.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  budgetCategories: many(budgetCategories),
}));

export const budgetCategoriesRelations = relations(budgetCategories, ({ one }) => ({
  budget: one(budgets, { fields: [budgetCategories.budgetId], references: [budgets.id] }),
  category: one(categories, { fields: [budgetCategories.categoryId], references: [categories.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAccountSchema = createInsertSchema(accounts)
  .omit({ id: true, createdAt: true })
  .extend({
    balance: z.union([z.string(), z.number()]).transform(val => val.toString()),
    creditLimit: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
  });
export const insertCreditCardSchema = createInsertSchema(creditCards)
  .omit({ id: true, createdAt: true })
  .extend({
    limit: z.union([z.string(), z.number()]).transform(val => val.toString()),
    usedAmount: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
    closingDay: z.union([z.string(), z.number()]).transform(val => Number(val)),
    dueDay: z.union([z.string(), z.number()]).transform(val => Number(val)),
  });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z.union([z.string(), z.number()]).transform(val => val.toString()),
    installments: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
    currentInstallment: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
    isInvestmentTransfer: z.boolean().optional(),
    transferToAccountId: z.string().optional(),
    status: z.enum(['confirmed', 'pending']).optional(),
    recurrenceId: z.string().optional(),
  });

export const insertRecurrenceSchema = createInsertSchema(recurrences)
  .omit({ id: true, createdAt: true, nextExecutionDate: true, lastExecutedDate: true })
  .extend({
    amount: z.union([z.string(), z.number()]).transform(val => val.toString()),
    installments: z.union([z.string(), z.number()]).transform(val => Number(val)).default(1),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    isActive: z.boolean().optional(),
    startDate: z.union([z.string(), z.date()]).transform(val => 
      typeof val === 'string' ? new Date(val) : val
    ),
    endDate: z.union([z.string(), z.date(), z.null()]).transform(val => 
      val === null ? null : (typeof val === 'string' ? new Date(val) : val)
    ).optional(),
  });

export const updateRecurrenceSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  amount: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  creditCardId: z.string().nullish(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  installments: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  isActive: z.boolean().optional(),
  startDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  endDate: z.union([z.string(), z.date(), z.null()]).transform(val => 
    val === null ? null : (typeof val === 'string' ? new Date(val) : val)
  ).optional(),
});
export const insertAssetSchema = createInsertSchema(assets)
  .omit({ id: true, createdAt: true })
  .extend({
    quantity: z.union([z.string(), z.number()]).transform(val => val.toString()),
    averagePrice: z.union([z.string(), z.number()]).transform(val => val.toString()),
    currentPrice: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
  });
export const insertGoalSchema = createInsertSchema(goals)
  .omit({ id: true, createdAt: true })
  .extend({
    targetAmount: z.union([z.string(), z.number()]).transform(val => val.toString()),
    currentAmount: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
    monthlyContribution: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
  });
export const insertBudgetSchema = createInsertSchema(budgets)
  .omit({ id: true, createdAt: true })
  .extend({
    totalIncome: z.union([z.string(), z.number()]).transform(val => val.toString()),
    necessitiesBudget: z.union([z.string(), z.number()]).transform(val => val.toString()),
    wantsBudget: z.union([z.string(), z.number()]).transform(val => val.toString()),
    savingsBudget: z.union([z.string(), z.number()]).transform(val => val.toString()),
  });
export const insertBudgetCategorySchema = createInsertSchema(budgetCategories)
  .omit({ id: true, createdAt: true })
  .extend({
    allocatedAmount: z.union([z.string(), z.number()]).transform(val => val.toString()),
  });

export const insertInvestmentTransactionSchema = createInsertSchema(investmentTransactions)
  .omit({ id: true, createdAt: true })
  .extend({
    quantity: z.union([z.string(), z.number()]).transform(val => val.toString()),
    price: z.union([z.string(), z.number()]).transform(val => val.toString()),
    totalAmount: z.union([z.string(), z.number()]).transform(val => val.toString()),
    fees: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type CreditCard = typeof creditCards.$inferSelect;
export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Recurrence = typeof recurrences.$inferSelect;
export type InsertRecurrence = z.infer<typeof insertRecurrenceSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type InvestmentTransaction = typeof investmentTransactions.$inferSelect;
export type InsertInvestmentTransaction = z.infer<typeof insertInvestmentTransactionSchema>;


