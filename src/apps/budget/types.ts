export type ExpenseFrequency = 'monthly' | 'quarterly' | 'yearly';

export const FREQUENCY_LABELS: Record<ExpenseFrequency, string> = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  yearly: 'Jährlich',
};

export const FREQUENCY_DIVISOR: Record<ExpenseFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
  /** ISO date string (YYYY-MM-DD) when the expense starts / is due */
  date?: string;
  notes?: string;
}

export type Theme = 'dark' | 'light';

export interface Settings {
  theme: Theme;
  /** Monthly net income in € */
  netIncome: number;
}
