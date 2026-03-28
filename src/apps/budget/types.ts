export type ExpenseFrequency = 'monthly' | 'quarterly' | 'yearly';

export type ExpenseCategory =
  | 'wohnen'
  | 'mobilitaet'
  | 'lebensmittel'
  | 'gesundheit'
  | 'versicherungen'
  | 'kommunikation'
  | 'freizeit'
  | 'bildung'
  | 'kleidung'
  | 'sonstiges';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  wohnen: 'Wohnen',
  mobilitaet: 'Mobilität',
  lebensmittel: 'Lebensmittel',
  gesundheit: 'Gesundheit',
  versicherungen: 'Versicherungen',
  kommunikation: 'Kommunikation',
  freizeit: 'Freizeit',
  bildung: 'Bildung',
  kleidung: 'Kleidung',
  sonstiges: 'Sonstiges',
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  wohnen: '#3b82f6',
  mobilitaet: '#f59e0b',
  lebensmittel: '#10b981',
  gesundheit: '#ec4899',
  versicherungen: '#8b5cf6',
  kommunikation: '#06b6d4',
  freizeit: '#f97316',
  bildung: '#84cc16',
  kleidung: '#a78bfa',
  sonstiges: '#94a3b8',
};

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
  category?: ExpenseCategory;
}

export type Theme = 'dark' | 'light';

export interface Settings {
  theme: Theme;
  /** Monthly net income in € */
  netIncome: number;
}
