import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense', 'transfer']);
export const categoryTypeEnum = pgEnum('category_type', ['necessities', 'wants', 'savings']);
export const accountTypeEnum = pgEnum('account_type', ['checking', 'savings', 'investment']);
export const assetTypeEnum = pgEnum('asset_type', ['stock', 'fii', 'crypto', 'fixed_income', 'etf']);
export const goalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'paused']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
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
  type: categoryTypeEnum("type").notNull(),
  color: text("color").default("#1565C0"),
  icon: text("icon").default("fas fa-circle"),
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
  installments: integer("installments").default(1),
  currentInstallment: integer("current_installment").default(1),
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
  totalIncome: decimal("total_income", { precision: 12, scale: 2 }).notNull(),
  necessitiesBudget: decimal("necessities_budget", { precision: 12, scale: 2 }).notNull(),
  wantsBudget: decimal("wants_budget", { precision: 12, scale: 2 }).notNull(),
  savingsBudget: decimal("savings_budget", { precision: 12, scale: 2 }).notNull(),
  necessitiesSpent: decimal("necessities_spent", { precision: 12, scale: 2 }).default("0.00"),
  wantsSpent: decimal("wants_spent", { precision: 12, scale: 2 }).default("0.00"),
  savingsSpent: decimal("savings_spent", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  creditCards: many(creditCards),
  categories: many(categories),
  transactions: many(transactions),
  assets: many(assets),
  goals: many(goals),
  budgets: many(budgets),
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
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  user: one(users, { fields: [assets.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
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
    creditLimit: z.union([z.string(), z.number()]).transform(val => val.toString()),
    usedAmount: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
  });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z.union([z.string(), z.number()]).transform(val => val.toString()),
    installments: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
    currentInstallment: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
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
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
