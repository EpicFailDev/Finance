import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// Transactions table
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  category: text('category').notNull(),
  type: text('type').notNull(), // 'Entrada' | 'Saída'
  paymentMethod: text('payment_method').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Budgets table - monthly limits per category (renamed conceptually to Caixinhas)
export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  limit: real('limit').notNull(), // This is the target goal
  currentAmount: real('current_amount').notNull().default(0), // Manual progress
  month: text('month').notNull(), // YYYY-MM
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Type exports for use in routes
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
