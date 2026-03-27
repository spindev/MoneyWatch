import React, { useState } from 'react';
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
  const [_year, month, day] = iso.split('-');
  return `${day}.${month}.`;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return null;
  }

  const sorted = [...expenses].sort((a, b) => monthlyAmount(b) - monthlyAmount(a));

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-gray-900 dark:text-white font-semibold text-base">
          Ausgaben ({expenses.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {sorted.map((expense) => (
          <div
            key={expense.id}
            onClick={() => onEdit(expense)}
            className="flex items-center gap-3 px-4 sm:px-6 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group cursor-pointer"
          >
            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{expense.name}</p>
              <p className="text-gray-500 dark:text-slate-400 text-xs">
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
            </div>

            {/* Delete action */}
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={(e) => handleDeleteClick(e, expense.id)}
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

    {/* Delete confirmation dialog */}
    {confirmDeleteId && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={() => setConfirmDeleteId(null)}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold">Ausgabe löschen?</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
                {expenses.find((e) => e.id === confirmDeleteId)?.name ?? 'Diese Ausgabe'} wird unwiderruflich gelöscht.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
