import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSalesInvoiceSchema, insertSalesItemSchema, insertCollectionSchema, insertSalesReturnSchema, insertReturnItemSchema, insertJournalEntrySchema, InsertJournalEntry } from "../shared/schema";
import { z } from "zod";

const salesFormSchema = z.object({
  invoiceNumber: z.string().min(1),
  customerName: z.string().min(1),
  date: z.string(),
  paymentMethod: z.enum(['cash', 'credit']),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    cogsUnit: z.number().positive(),
  })).min(1)
});

const collectionFormSchema = z.object({
  invoiceId: z.number(),
  date: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.string(),
  notes: z.string().optional(),
});

const returnFormSchema = z.object({
  returnNumber: z.string().min(1),
  invoiceId: z.number(),
  date: z.string(),
  returnType: z.enum(['return', 'allowance']),
  reason: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    cogsUnit: z.number().positive(),
  })).min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Load data on startup
  await storage.loadFromFile();

  // Get balance sheet
  app.get("/api/balance-sheet", async (req, res) => {
    try {
      const balanceSheet = await storage.getBalanceSheet();
      res.json(balanceSheet);
    } catch (error) {
      res.status(500).json({ message: "Failed to get balance sheet" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Get journal entries
  app.get("/api/journal-entries", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get journal entries" });
    }
  });

  // Get sales invoices
  app.get("/api/sales-invoices", async (req, res) => {
    try {
      const invoices = await storage.getSalesInvoices();
      const invoicesWithItems = await Promise.all(
        invoices.map(async (invoice) => {
          const items = await storage.getSalesItemsByInvoiceId(invoice.id);
          return { ...invoice, items };
        })
      );
      res.json(invoicesWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sales invoices" });
    }
  });

  // Get collections
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Failed to get collections" });
    }
  });

  // Get sales returns
  app.get("/api/sales-returns", async (req, res) => {
    try {
      const returns = await storage.getSalesReturns();
      const returnsWithItems = await Promise.all(
        returns.map(async (returnItem) => {
          const items = await storage.getReturnItemsByReturnId(returnItem.id);
          return { ...returnItem, items };
        })
      );
      res.json(returnsWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sales returns" });
    }
  });

  // Create sales transaction
  app.post("/api/sales", async (req, res) => {
    try {
      const data = salesFormSchema.parse(req.body);
      
      const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalCOGS = data.items.reduce((sum, item) => sum + (item.quantity * item.cogsUnit), 0);

      // Create sales invoice
      const invoice = await storage.createSalesInvoice({
        invoiceNumber: data.invoiceNumber,
        customerName: data.customerName,
        date: new Date(data.date),
        totalAmount: totalAmount.toString(),
        paidAmount: data.paymentMethod === 'cash' ? totalAmount.toString() : '0',
        outstandingAmount: data.paymentMethod === 'cash' ? '0' : totalAmount.toString(),
        paymentMethod: data.paymentMethod,
        status: data.paymentMethod === 'cash' ? 'paid' : 'open'
      });

      // Create sales items
      for (const item of data.items) {
        await storage.createSalesItem({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          cogsUnit: item.cogsUnit.toString(),
          totalAmount: (item.quantity * item.unitPrice).toString()
        });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        date: new Date(data.date),
        reference: data.invoiceNumber,
        description: `Sale to ${data.customerName}`,
        type: 'sale',
        totalAmount: totalAmount.toString()
      });

      // Create journal entries: Deb Cash/AR, Cr Sales Revenue, Deb COGS, Cr Inventory
      const journalEntries: InsertJournalEntry[] = [];

      // Debit Cash or Accounts Receivable, Credit Sales Revenue
      if (data.paymentMethod === 'cash') {
        journalEntries.push({
          transactionId: transaction.id,
          accountId: null,
          accountCode: '1001',
          accountName: 'Cash',
          debitAmount: totalAmount.toString(),
          creditAmount: '0',
          date: new Date(data.date),
          reference: data.invoiceNumber,
          description: `Sale to ${data.customerName}`
        });
      } else {
        journalEntries.push({
          transactionId: transaction.id,
          accountId: null,
          accountCode: '1002',
          accountName: 'Accounts Receivable',
          debitAmount: totalAmount.toString(),
          creditAmount: '0',
          date: new Date(data.date),
          reference: data.invoiceNumber,
          description: `Sale to ${data.customerName}`
        });
      }

      journalEntries.push({
        transactionId: transaction.id,
        accountId: null,
        accountCode: '4001',
        accountName: 'Sales Revenue',
        debitAmount: '0',
        creditAmount: totalAmount.toString(),
        date: new Date(data.date),
        reference: data.invoiceNumber,
        description: `Sale to ${data.customerName}`
      });

      // Debit COGS, Credit Inventory
      journalEntries.push({
        transactionId: transaction.id,
        accountId: null,
        accountCode: '5001',
        accountName: 'Cost of Goods Sold',
        debitAmount: totalCOGS.toString(),
        creditAmount: '0',
        date: new Date(data.date),
        reference: data.invoiceNumber,
        description: `COGS for sale to ${data.customerName}`
      });

      journalEntries.push({
        transactionId: transaction.id,
        accountId: null,
        accountCode: '1003',
        accountName: 'Inventory',
        debitAmount: '0',
        creditAmount: totalCOGS.toString(),
        date: new Date(data.date),
        reference: data.invoiceNumber,
        description: `COGS for sale to ${data.customerName}`
      });

      await storage.createJournalEntries(journalEntries);

      // Update account balances
      if (data.paymentMethod === 'cash') {
        const cashAccount = await storage.getAccountByCode('1001');
        await storage.updateAccountBalance('1001', parseFloat(cashAccount?.balance || '0') + totalAmount);
      } else {
        const arAccount = await storage.getAccountByCode('1002');
        await storage.updateAccountBalance('1002', parseFloat(arAccount?.balance || '0') + totalAmount);
      }

      const inventoryAccount = await storage.getAccountByCode('1003');
      await storage.updateAccountBalance('1003', parseFloat(inventoryAccount?.balance || '0') - totalCOGS);

      // Update Sales Revenue account
      const salesRevenueAccount = await storage.getAccountByCode('4001');
      await storage.updateAccountBalance('4001', parseFloat(salesRevenueAccount?.balance || '0') + totalAmount);

      // Update COGS account
      const cogsAccount = await storage.getAccountByCode('5001');
      await storage.updateAccountBalance('5001', parseFloat(cogsAccount?.balance || '0') + totalCOGS);

      // Update Share Capital with net income (Sales Revenue - COGS)
      const netIncome = totalAmount - totalCOGS;
      const shareCapitalAccount = await storage.getAccountByCode('3001');
      await storage.updateAccountBalance('3001', parseFloat(shareCapitalAccount?.balance || '0') + netIncome);

      await storage.saveToFile();
      res.json({ success: true, invoice });
    } catch (error) {
      console.error('Sales creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid sales data" });
    }
  });

  // Create collection
  app.post("/api/collections", async (req, res) => {
    try {
      const data = collectionFormSchema.parse(req.body);
      
      const invoice = await storage.getSalesInvoiceById(data.invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const currentOutstanding = parseFloat(invoice.outstandingAmount);
      if (data.amount > currentOutstanding) {
        return res.status(400).json({ message: "Collection amount exceeds outstanding balance" });
      }

      // Create collection record
      const collection = await storage.createCollection({
        invoiceId: data.invoiceId,
        date: new Date(data.date),
        amount: data.amount.toString(),
        paymentMethod: data.paymentMethod,
        notes: data.notes || '',
        reference: `COL-${invoice.invoiceNumber}`
      });

      // Update invoice payment status
      const newPaidAmount = parseFloat(invoice.paidAmount ?? "0") + data.amount;
      const newOutstandingAmount = currentOutstanding - data.amount;
      const newStatus = newOutstandingAmount === 0 ? 'paid' : 'partial';

      await storage.updateSalesInvoicePayment(data.invoiceId, newPaidAmount, newOutstandingAmount, newStatus);

      // Create transaction
      const transaction = await storage.createTransaction({
        date: new Date(data.date),
        reference: `COL-${invoice.invoiceNumber}`,
        description: `Collection from ${invoice.customerName}`,
        type: 'collection',
        totalAmount: data.amount.toString()
      });

      // Create journal entries: Debit Cash, Credit Accounts Receivable
      const journalEntries: InsertJournalEntry[] = [
        {
          transactionId: transaction.id,
          accountId: null,
          accountCode: '1001',
          accountName: 'Cash',
          debitAmount: data.amount.toString(),
          creditAmount: '0',
          date: new Date(data.date),
          reference: `COL-${invoice.invoiceNumber}`,
          description: `Collection from ${invoice.customerName}`
        },
        {
          transactionId: transaction.id,
          accountId: null,
          accountCode: '1002',
          accountName: 'Accounts Receivable',
          debitAmount: '0',
          creditAmount: data.amount.toString(),
          date: new Date(data.date),
          reference: `COL-${invoice.invoiceNumber}`,
          description: `Collection from ${invoice.customerName}`
        }
      ];

      await storage.createJournalEntries(journalEntries);

      // Update account balances
      const cashAccount = await storage.getAccountByCode('1001');
      await storage.updateAccountBalance('1001', parseFloat(cashAccount?.balance || '0') + data.amount);

      const arAccount = await storage.getAccountByCode('1002');
      await storage.updateAccountBalance('1002', parseFloat(arAccount?.balance || '0') - data.amount);

      await storage.saveToFile();
      res.json({ success: true, collection });
    } catch (error) {
      console.error('Collection creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid collection data" });
    }
  });

  // Create sales return
  app.post("/api/sales-returns", async (req, res) => {
    try {
      const data = returnFormSchema.parse(req.body);
      
      const invoice = await storage.getSalesInvoiceById(data.invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const totalReturnAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const totalReturnCOGS = data.items.reduce((sum, item) => sum + (item.quantity * item.cogsUnit), 0);

      // Create sales return
      const salesReturn = await storage.createSalesReturn({
        returnNumber: data.returnNumber,
        invoiceId: data.invoiceId,
        date: new Date(data.date),
        totalAmount: totalReturnAmount.toString(),
        returnType: data.returnType,
        reason: data.reason || ''
      });

      // Create return items
      for (const item of data.items) {
        await storage.createReturnItem({
          returnId: salesReturn.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          cogsUnit: item.cogsUnit.toString(),
          totalAmount: (item.quantity * item.unitPrice).toString()
        });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        date: new Date(data.date),
        reference: data.returnNumber,
        description: `Return from ${invoice.customerName}`,
        type: 'return',
        totalAmount: totalReturnAmount.toString()
      });

      // Create journal entries for sales return
      const journalEntries: InsertJournalEntry[] = [];

      // Debit Sales Return and Allowances, Credit Cash/AR (depending on original payment method)
      journalEntries.push({
        transactionId: transaction.id,
        accountId: null,
        accountCode: '4002',
        accountName: 'Sales Return and Allowances',
        debitAmount: totalReturnAmount.toString(),
        creditAmount: '0',
        date: new Date(data.date),
        reference: data.returnNumber,
        description: `Return from ${invoice.customerName}`
      });

      if (invoice.paymentMethod === 'cash') {
        journalEntries.push({
          transactionId: transaction.id,
          accountId: null,
          accountCode: '1001',
          accountName: 'Cash',
          debitAmount: '0',
          creditAmount: totalReturnAmount.toString(),
          date: new Date(data.date),
          reference: data.returnNumber,
          description: `Return from ${invoice.customerName}`
        });
      } else {
        journalEntries.push({
          transactionId: transaction.id,
          accountId: null,
          accountCode: '1002',
          accountName: 'Accounts Receivable',
          debitAmount: '0',
          creditAmount: totalReturnAmount.toString(),
          date: new Date(data.date),
          reference: data.returnNumber,
          description: `Return from ${invoice.customerName}`
        });
      }

      // Debit Inventory, Credit COGS (returning goods to inventory)
      journalEntries.push({
        transactionId: transaction.id,
        accountId: null,
        accountCode: '1003',
        accountName: 'Inventory',
        debitAmount: totalReturnCOGS.toString(),
        creditAmount: '0',
        date: new Date(data.date),
        reference: data.returnNumber,
        description: `Return inventory from ${invoice.customerName}`
      });

      journalEntries.push({
        transactionId: transaction.id,
        accountId: null,
        accountCode: '5001',
        accountName: 'Cost of Goods Sold',
        debitAmount: '0',
        creditAmount: totalReturnCOGS.toString(),
        date: new Date(data.date),
        reference: data.returnNumber,
        description: `Return COGS from ${invoice.customerName}`
      });

      await storage.createJournalEntries(journalEntries);

      // Update account balances
      if (invoice.paymentMethod === 'cash') {
        const cashAccount = await storage.getAccountByCode('1001');
        await storage.updateAccountBalance('1001', parseFloat(cashAccount?.balance || '0') - totalReturnAmount);
      } else {
        const arAccount = await storage.getAccountByCode('1002');
        await storage.updateAccountBalance('1002', parseFloat(arAccount?.balance || '0') - totalReturnAmount);
      }

      const inventoryAccount = await storage.getAccountByCode('1003');
      await storage.updateAccountBalance('1003', parseFloat(inventoryAccount?.balance || '0') + totalReturnCOGS);

      // Update Sales Returns account
      const salesReturnsAccount = await storage.getAccountByCode('4002');
      await storage.updateAccountBalance('4002', parseFloat(salesReturnsAccount?.balance || '0') + totalReturnAmount);

      // Update COGS account (reduce it)
      const cogsAccount = await storage.getAccountByCode('5001');
      await storage.updateAccountBalance('5001', parseFloat(cogsAccount?.balance || '0') - totalReturnCOGS);

      // Update Share Capital (reduce net income due to return)
      const netReduction = totalReturnAmount - totalReturnCOGS;
      const shareCapitalAccount = await storage.getAccountByCode('3001');
      await storage.updateAccountBalance('3001', parseFloat(shareCapitalAccount?.balance || '0') - netReduction);

      await storage.saveToFile();
      res.json({ success: true, salesReturn });
    } catch (error) {
      console.error('Sales return creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid return data" });
    }
  });

  // Export data
  app.get("/api/export-data", async (req, res) => {
    try {
      const data = await storage.exportData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=accounting_data_${new Date().toISOString().split('T')[0]}.json`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Import data
  app.post("/api/import-data", async (req, res) => {
    try {
      await storage.importData(req.body);
      await storage.saveToFile();
      res.json({ success: true, message: "Data imported successfully" });
    } catch (error) {
      console.error('Import error:', error);
      res.status(400).json({ message: "Failed to import data" });
    }
  });

  // Manual save
  app.post("/api/save", async (req, res) => {
    try {
      await storage.saveToFile();
      res.json({ success: true, message: "Data saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}