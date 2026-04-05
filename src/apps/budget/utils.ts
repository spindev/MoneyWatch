import type { Expense, ExpenseFrequency } from './types';
import { FREQUENCY_DIVISOR } from './types';

/** Returns the normalised monthly amount for an expense. */
export function monthlyAmount(expense: Expense): number {
  return expense.amount / FREQUENCY_DIVISOR[expense.frequency as ExpenseFrequency];
}
