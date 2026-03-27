import React from 'react';
import type { Expense } from '../types';
import { FREQUENCY_LABELS, FREQUENCY_DIVISOR } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function fmt(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthlyAmount(expense: Expense): number {
  return expense.amount / FREQUENCY_DIVISOR[expense.frequency];
}

function fmtDate(iso?: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-gray-900 dark:text-white font-semibold text-base">
          Ausgaben ({expenses.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group">
            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{expense.name}</p>
              <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
                {FREQUENCY_LABELS[expense.frequency]}
                {expense.date && (
                  <span className="ml-1">· {fmtDate(expense.date)}</span>
                )}
                {expense.notes && (
                  <span className="ml-1 italic">· {expense.notes}</span>
                )}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <p className="text-gray-900 dark:text-white text-sm font-semibold tabular-nums">
                {fmt(expense.amount)} €
              </p>
              <p className="text-gray-400 dark:text-slate-500 text-xs">
                {fmt(monthlyAmount(expense))} € / Monat
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(expense)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                aria-label="Bearbeiten"
                title="Bearbeiten"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label="Löschen"
                title="Löschen"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
