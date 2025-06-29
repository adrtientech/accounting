import fs from 'fs/promises';
import path from 'path';
import {
  Account, InsertAccount,
  Transaction, InsertTransaction,
  JournalEntry, InsertJournalEntry,
  SalesInvoice, InsertSalesInvoice,
  SalesItem, InsertSalesItem,
  Collection, InsertCollection,
  SalesReturn, InsertSalesReturn,
  ReturnItem, InsertReturnItem,
  BalanceSheet, AccountingStats
} from "../shared/schema";

export interface IStorage {
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccountByCode(code: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(code: string, balance: number): Promise<void>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Journal Entries
  getJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  createJournalEntries(entries: InsertJournalEntry[]): Promise<JournalEntry[]>;

  // Sales Invoices
  getSalesInvoices(): Promise<SalesInvoice[]>;
  getSalesInvoiceById(id: number): Promise<SalesInvoice | undefined>;
  createSalesInvoice(invoice: InsertSalesInvoice): Promise<SalesInvoice>;
  updateSalesInvoicePayment(id: number, paidAmount: number, outstandingAmount: number, status: string): Promise<void>;

  // Sales Items
  getSalesItemsByInvoiceId(invoiceId: number): Promise<SalesItem[]>;
  createSalesItem(item: InsertSalesItem): Promise<SalesItem>;

  // Collections
  getCollections(): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;

  // Sales Returns
  getSalesReturns(): Promise<SalesReturn[]>;
  createSalesReturn(salesReturn: InsertSalesReturn): Promise<SalesReturn>;

  // Return Items
  getReturnItemsByReturnId(returnId: number): Promise<ReturnItem[]>;
  createReturnItem(item: InsertReturnItem): Promise<ReturnItem>;

  // Balance Sheet & Stats
  getBalanceSheet(): Promise<BalanceSheet>;
  getStats(): Promise<AccountingStats>;

  // Data persistence
  saveToFile(): Promise<void>;
  loadFromFile(): Promise<void>;
  exportData(): Promise<any>;
  importData(data: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private accounts: Map<number, Account> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private journalEntries: Map<number, JournalEntry> = new Map();
  private salesInvoices: Map<number, SalesInvoice> = new Map();
  private salesItems: Map<number, SalesItem> = new Map();
  private collections: Map<number, Collection> = new Map();
  private salesReturns: Map<number, SalesReturn> = new Map();
  private returnItems: Map<number, ReturnItem> = new Map();

  private currentAccountId = 1;
  private currentTransactionId = 1;
  private currentJournalEntryId = 1;
  private currentSalesInvoiceId = 1;
  private currentSalesItemId = 1;
  private currentCollectionId = 1;
  private currentSalesReturnId = 1;
  private currentReturnItemId = 1;

  constructor() {
    this.initializeChartOfAccounts();
  }

  private initializeChartOfAccounts() {
    const defaultAccounts: InsertAccount[] = [
      { code: '1001', name: 'Cash', type: 'asset', balance: '2375000' },
      { code: '1002', name: 'Accounts Receivable', type: 'asset', balance: '0' },
      { code: '1003', name: 'Inventory', type: 'asset', balance: '450000' },
      { code: '2001', name: 'Accounts Payable', type: 'liability', balance: '0' },
      { code: '3001', name: 'Share Capital - Ordinary', type: 'equity', balance: '2825000' },
      { code: '4001', name: 'Sales Revenue', type: 'revenue', balance: '0' },
      { code: '4002', name: 'Sales Return and Allowances', type: 'revenue', balance: '0' },
      { code: '5001', name: 'Cost of Goods Sold', type: 'expense', balance: '0' },
    ];

    defaultAccounts.forEach(account => {
      const newAccount: Account = {
        id: this.currentAccountId++,
        code: account.code,
        name: account.name,
        type: account.type,
        balance: account.balance ?? "0"
      };
      this.accounts.set(newAccount.id, newAccount);
    });
  }

  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccountByCode(code: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(account => account.code === code);
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const newAccount: Account = {
      id: this.currentAccountId++,
      code: account.code,
      name: account.name,
      type: account.type,
      balance: account.balance ?? "0"
    };
    this.accounts.set(newAccount.id, newAccount);
    return newAccount;
  }

  async updateAccountBalance(code: string, balance: number): Promise<void> {
    const account = await this.getAccountByCode(code);
    if (account) {
      account.balance = balance.toString();
      this.accounts.set(account.id, account);
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.currentTransactionId++,
      createdAt: new Date(),
      ...transaction
    };
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const newEntry: JournalEntry = {
      id: this.currentJournalEntryId++,
      transactionId: entry.transactionId || null,
      accountId: entry.accountId || null,
      accountCode: entry.accountCode,
      accountName: entry.accountName,
      debitAmount: entry.debitAmount || "0",
      creditAmount: entry.creditAmount || "0",
      date: entry.date,
      reference: entry.reference,
      description: entry.description
    };
    this.journalEntries.set(newEntry.id, newEntry);
    return newEntry;
  }

  async createJournalEntries(entries: InsertJournalEntry[]): Promise<JournalEntry[]> {
    const newEntries: JournalEntry[] = [];
    for (const entry of entries) {
      const newEntry = await this.createJournalEntry(entry);
      newEntries.push(newEntry);
    }
    return newEntries;
  }

  async getSalesInvoices(): Promise<SalesInvoice[]> {
    return Array.from(this.salesInvoices.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getSalesInvoiceById(id: number): Promise<SalesInvoice | undefined> {
    return this.salesInvoices.get(id);
  }

  async createSalesInvoice(invoice: InsertSalesInvoice): Promise<SalesInvoice> {
    const newInvoice: SalesInvoice = {
      id: this.currentSalesInvoiceId++,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      date: invoice.date,
      paymentMethod: invoice.paymentMethod,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount ?? null,
      outstandingAmount: invoice.outstandingAmount,
      status: invoice.status ?? "Open"
    };
    this.salesInvoices.set(newInvoice.id, newInvoice);
    return newInvoice;
  }

  async updateSalesInvoicePayment(id: number, paidAmount: number, outstandingAmount: number, status: string): Promise<void> {
    const invoice = this.salesInvoices.get(id);
    if (invoice) {
      invoice.paidAmount = paidAmount.toString();
      invoice.outstandingAmount = outstandingAmount.toString();
      invoice.status = status;
      this.salesInvoices.set(id, invoice);
    }
  }

  async getSalesItemsByInvoiceId(invoiceId: number): Promise<SalesItem[]> {
    return Array.from(this.salesItems.values()).filter(item => item.invoiceId === invoiceId);
  }

  async createSalesItem(item: InsertSalesItem): Promise<SalesItem> {
    const newItem: SalesItem = {
      id: this.currentSalesItemId++,
      invoiceId: item.invoiceId ?? null,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      cogsUnit: item.cogsUnit,
      totalAmount: item.totalAmount
    };
    this.salesItems.set(newItem.id, newItem);
    return newItem;
  }

  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const newCollection: Collection = {
      id: this.currentCollectionId++,
      invoiceId: collection.invoiceId ?? null,
      date: collection.date,
      paymentMethod: collection.paymentMethod,
      amount: collection.amount,
      reference: collection.reference,
      notes: collection.notes ?? null
    };
    this.collections.set(newCollection.id, newCollection);
    return newCollection;
  }

  async getSalesReturns(): Promise<SalesReturn[]> {
    return Array.from(this.salesReturns.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createSalesReturn(salesReturn: InsertSalesReturn): Promise<SalesReturn> {
    const newReturn: SalesReturn = {
      id: this.currentSalesReturnId++,
      invoiceId: salesReturn.invoiceId ?? null,
      date: salesReturn.date,
      returnNumber: salesReturn.returnNumber,
      returnType: salesReturn.returnType,
      reason: salesReturn.reason ?? null,
      totalAmount: salesReturn.totalAmount
    };
    this.salesReturns.set(newReturn.id, newReturn);
    return newReturn;
  }

  async getReturnItemsByReturnId(returnId: number): Promise<ReturnItem[]> {
    return Array.from(this.returnItems.values()).filter(item => item.returnId === returnId);
  }

  async createReturnItem(item: InsertReturnItem): Promise<ReturnItem> {
    const newItem: ReturnItem = {
      id: this.currentReturnItemId++,
      returnId: item.returnId ?? null,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      cogsUnit: item.cogsUnit,
      totalAmount: item.totalAmount
    };
    this.returnItems.set(newItem.id, newItem);
    return newItem;
  }

  async getBalanceSheet(): Promise<BalanceSheet> {
    const cash = await this.getAccountByCode('1001');
    const accountsReceivable = await this.getAccountByCode('1002');
    const inventory = await this.getAccountByCode('1003');
    const accountsPayable = await this.getAccountByCode('2001');
    const shareCapital = await this.getAccountByCode('3001');

    const cashBalance = parseFloat(cash?.balance || '0');
    const arBalance = parseFloat(accountsReceivable?.balance || '0');
    const inventoryBalance = parseFloat(inventory?.balance || '0');
    const apBalance = parseFloat(accountsPayable?.balance || '0');
    const scBalance = parseFloat(shareCapital?.balance || '0');

    const totalAssets = cashBalance + arBalance + inventoryBalance;
    const totalLiabilities = apBalance;
    
    // Share Capital already includes net income - no separate net income line
    const totalEquity = scBalance;

    return {
      cash: cashBalance,
      accountsReceivable: arBalance,
      inventory: inventoryBalance,
      totalAssets,
      accountsPayable: apBalance,
      totalLiabilities,
      shareCapital: scBalance,
      totalEquity,
      totalLiabEquity: totalLiabilities + totalEquity
    };
  }

  async getStats(): Promise<AccountingStats> {
    const invoices = await this.getSalesInvoices();
    const collections = await this.getCollections();
    const returns = await this.getSalesReturns();
    
    // Get revenue and expense accounts
    const salesRevenue = await this.getAccountByCode('4001');
    const salesReturns = await this.getAccountByCode('4002');
    const cogs = await this.getAccountByCode('5001');

    const totalSales = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount), 0);
    const totalCollections = collections.reduce((sum, collection) => sum + parseFloat(collection.amount), 0);
    const totalReturns = returns.reduce((sum, returnItem) => sum + parseFloat(returnItem.totalAmount), 0);
    const outstandingReceivables = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.outstandingAmount), 0);

    const revenue = parseFloat(salesRevenue?.balance || '0');
    const returnsAmount = parseFloat(salesReturns?.balance || '0');
    const cogsAmount = parseFloat(cogs?.balance || '0');
    
    const netRevenue = revenue - returnsAmount;
    const grossProfit = netRevenue - cogsAmount;
    const netIncome = grossProfit; // Simplified - no other expenses in current model

    return {
      totalSales,
      totalCollections,
      totalReturns,
      outstandingReceivables,
      netIncome,
      grossProfit
    };
  }

  async saveToFile(): Promise<void> {
    const data = {
      accounts: Array.from(this.accounts.entries()),
      transactions: Array.from(this.transactions.entries()),
      journalEntries: Array.from(this.journalEntries.entries()),
      salesInvoices: Array.from(this.salesInvoices.entries()),
      salesItems: Array.from(this.salesItems.entries()),
      collections: Array.from(this.collections.entries()),
      salesReturns: Array.from(this.salesReturns.entries()),
      returnItems: Array.from(this.returnItems.entries()),
      counters: {
        currentAccountId: this.currentAccountId,
        currentTransactionId: this.currentTransactionId,
        currentJournalEntryId: this.currentJournalEntryId,
        currentSalesInvoiceId: this.currentSalesInvoiceId,
        currentSalesItemId: this.currentSalesItemId,
        currentCollectionId: this.currentCollectionId,
        currentSalesReturnId: this.currentSalesReturnId,
        currentReturnItemId: this.currentReturnItemId,
      }
    };

    const filePath = path.join(process.cwd(), 'accounting_data.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async loadFromFile(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'accounting_data.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      this.accounts = new Map(data.accounts);
      this.transactions = new Map(data.transactions);
      this.journalEntries = new Map(data.journalEntries);
      this.salesInvoices = new Map(data.salesInvoices);
      this.salesItems = new Map(data.salesItems);
      this.collections = new Map(data.collections);
      this.salesReturns = new Map(data.salesReturns);
      this.returnItems = new Map(data.returnItems);

      if (data.counters) {
        this.currentAccountId = data.counters.currentAccountId;
        this.currentTransactionId = data.counters.currentTransactionId;
        this.currentJournalEntryId = data.counters.currentJournalEntryId;
        this.currentSalesInvoiceId = data.counters.currentSalesInvoiceId;
        this.currentSalesItemId = data.counters.currentSalesItemId;
        this.currentCollectionId = data.counters.currentCollectionId;
        this.currentSalesReturnId = data.counters.currentSalesReturnId;
        this.currentReturnItemId = data.counters.currentReturnItemId;
      }
    } catch (error) {
      console.log('No existing data file found, using defaults');
    }
  }

  async exportData(): Promise<any> {
    return {
      accounts: Array.from(this.accounts.entries()),
      transactions: Array.from(this.transactions.entries()),
      journalEntries: Array.from(this.journalEntries.entries()),
      salesInvoices: Array.from(this.salesInvoices.entries()),
      salesItems: Array.from(this.salesItems.entries()),
      collections: Array.from(this.collections.entries()),
      salesReturns: Array.from(this.salesReturns.entries()),
      returnItems: Array.from(this.returnItems.entries()),
      counters: {
        currentAccountId: this.currentAccountId,
        currentTransactionId: this.currentTransactionId,
        currentJournalEntryId: this.currentJournalEntryId,
        currentSalesInvoiceId: this.currentSalesInvoiceId,
        currentSalesItemId: this.currentSalesItemId,
        currentCollectionId: this.currentCollectionId,
        currentSalesReturnId: this.currentSalesReturnId,
        currentReturnItemId: this.currentReturnItemId,
      }
    };
  }

  async importData(data: any): Promise<void> {
    this.accounts = new Map(data.accounts);
    this.transactions = new Map(data.transactions);
    this.journalEntries = new Map(data.journalEntries);
    this.salesInvoices = new Map(data.salesInvoices);
    this.salesItems = new Map(data.salesItems);
    this.collections = new Map(data.collections);
    this.salesReturns = new Map(data.salesReturns);
    this.returnItems = new Map(data.returnItems);

    if (data.counters) {
      this.currentAccountId = data.counters.currentAccountId;
      this.currentTransactionId = data.counters.currentTransactionId;
      this.currentJournalEntryId = data.counters.currentJournalEntryId;
      this.currentSalesInvoiceId = data.counters.currentSalesInvoiceId;
      this.currentSalesItemId = data.counters.currentSalesItemId;
      this.currentCollectionId = data.counters.currentCollectionId;
      this.currentSalesReturnId = data.counters.currentSalesReturnId;
      this.currentReturnItemId = data.counters.currentReturnItemId;
    }
  }
}

export const storage = new MemStorage();