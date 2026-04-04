import { createListStorage } from '../../../lib/storage';
import type { Expense } from '../types';

const svc = createListStorage<Expense>('budgetwatch_expenses');
export const loadExpenses = svc.load;
export const saveExpenses = svc.save;
