// Accounting utility functions for the comprehensive accounting system

export interface ChartOfAccounts {
  [key: string]: {
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    normalBalance: 'debit' | 'credit';
  };
}

export const CHART_OF_ACCOUNTS: ChartOfAccounts = {
  '1000': { name: 'Cash', type: 'asset', normalBalance: 'debit' },
  '1100': { name: 'Accounts Receivable', type: 'asset', normalBalance: 'debit' },
  '1200': { name: 'Inventory', type: 'asset', normalBalance: 'debit' },
  '2000': { name: 'Accounts Payable', type: 'liability', normalBalance: 'credit' },
  '3000': { name: 'Share Capital - Ordinary', type: 'equity', normalBalance: 'credit' },
  '4000': { name: 'Sales Revenue', type: 'revenue', normalBalance: 'credit' },
  '4100': { name: 'Sales Returns and Allowances', type: 'revenue', normalBalance: 'debit' },
  '5000': { name: 'Cost of Goods Sold', type: 'expense', normalBalance: 'debit' },
};

export function getAccountName(code: string): string {
  return CHART_OF_ACCOUNTS[code]?.name || `Unknown Account (${code})`;
}

export function getAccountType(code: string): string {
  return CHART_OF_ACCOUNTS[code]?.type || 'unknown';
}

export function isDebitAccount(code: string): boolean {
  return CHART_OF_ACCOUNTS[code]?.normalBalance === 'debit';
}

export function calculateNetIncome(revenues: number, expenses: number): number {
  return revenues - expenses;
}

export function validateJournalEntry(debits: number, credits: number): boolean {
  return Math.abs(debits - credits) < 0.01; // Allow for small rounding differences
}

export function generateInvoiceNumber(): string {
  return `INV-${Date.now()}`;
}

export function generateReturnNumber(): string {
  return `RET-${Date.now()}`;
}

export function calculateTotalAmount(items: Array<{ quantity: string; unitPrice: string }>): number {
  return items.reduce((total, item) => {
    return total + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
  }, 0);
}

export function formatAccountingDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function parseAccountingAmount(amount: string | number): number {
  if (typeof amount === 'number') return amount;
  return parseFloat(amount) || 0;
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
] as const;

export const RETURN_TYPES = [
  { value: 'return', label: 'Product Return' },
  { value: 'allowance', label: 'Sales Allowance' },
] as const;