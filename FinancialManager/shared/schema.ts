import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'asset', 'liability', 'equity', 'revenue', 'expense'
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  reference: text("reference").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'sale', 'collection', 'return', 'expense', 'investment'
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  accountId: integer("account_id").references(() => accounts.id),
  accountCode: text("account_code").notNull(),
  accountName: text("account_name").notNull(),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0"),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0"),
  date: timestamp("date").notNull(),
  reference: text("reference").notNull(),
  description: text("description").notNull(),
});

export const salesInvoices = pgTable("sales_invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  date: timestamp("date").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  outstandingAmount: decimal("outstanding_amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'credit'
  status: text("status").notNull().default("open"), // 'open', 'paid', 'partial'
});

export const salesItems = pgTable("sales_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => salesInvoices.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  cogsUnit: decimal("cogs_unit", { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => salesInvoices.id),
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  notes: text("notes"),
  reference: text("reference").notNull(),
});

export const salesReturns = pgTable("sales_returns", {
  id: serial("id").primaryKey(),
  returnNumber: text("return_number").notNull().unique(),
  invoiceId: integer("invoice_id").references(() => salesInvoices.id),
  date: timestamp("date").notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  returnType: text("return_type").notNull(), // 'return', 'allowance'
  reason: text("reason"),
});

export const returnItems = pgTable("return_items", {
  id: serial("id").primaryKey(),
  returnId: integer("return_id").references(() => salesReturns.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  cogsUnit: decimal("cogs_unit", { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
});

// Insert schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export const insertSalesInvoiceSchema = createInsertSchema(salesInvoices).omit({ id: true });
export const insertSalesItemSchema = createInsertSchema(salesItems).omit({ id: true });
export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true });
export const insertSalesReturnSchema = createInsertSchema(salesReturns).omit({ id: true });
export const insertReturnItemSchema = createInsertSchema(returnItems).omit({ id: true });

// Types
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type SalesInvoice = typeof salesInvoices.$inferSelect;
export type InsertSalesInvoice = z.infer<typeof insertSalesInvoiceSchema>;
export type SalesItem = typeof salesItems.$inferSelect;
export type InsertSalesItem = z.infer<typeof insertSalesItemSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type SalesReturn = typeof salesReturns.$inferSelect;
export type InsertSalesReturn = z.infer<typeof insertSalesReturnSchema>;
export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;

// Balance Sheet type - Updated to not show net income separately
export interface BalanceSheet {
  cash: number;
  accountsReceivable: number;
  inventory: number;
  totalAssets: number;
  accountsPayable: number;
  totalLiabilities: number;
  shareCapital: number; // This includes net income/loss
  totalEquity: number;
  totalLiabEquity: number;
}

// Statistics type
export interface AccountingStats {
  totalSales: number;
  totalCollections: number;
  totalReturns: number;
  outstandingReceivables: number;
  netIncome: number;
  grossProfit: number;
}