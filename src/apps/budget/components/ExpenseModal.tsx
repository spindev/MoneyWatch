import React, { useState } from 'react';
import type { Expense, ExpenseFrequency } from '../types';
import { FREQUENCY_LABELS } from '../types';

const CATEGORIES = [
  'Wohnen',
  'Lebensmittel',
  'Transport',
  'Versicherungen',
  'Unterhaltung',
  'Gesundheit',
  'Bildung',
  'Sonstiges',
];

interface ExpenseModalProps {
  expense: Expense | null;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}

function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onSave, onClose }) => {
  const [name, setName] = useState(expense?.name ?? '');
  const [amountStr, setAmountStr] = useState(
    expense ? String(expense.amount).replace('.', ',') : '',
  );
  const [frequency, setFrequency] = useState<ExpenseFrequency>(expense?.frequency ?? 'monthly');
  const [category, setCategory] = useState(expense?.category ?? 'Sonstiges');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Bitte einen Namen eingeben.');
      return;
    }
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setError('Bitte einen gültigen Betrag eingeben.');
      return;
    }
    onSave({
      id: expense?.id ?? newId(),
      name: trimmed,
      amount,
      frequency,
      category,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">
              {expense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
              {expense ? 'Ausgabe aktualisieren' : 'Ausgabe erfassen'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-4 flex-shrink-0"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Name */}
          <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
              Bezeichnung
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="z. B. Miete, Netflix, KFZ-Versicherung"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Amount + frequency */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                Betrag (€)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => { setAmountStr(e.target.value); setError(''); }}
                placeholder="0,00"
                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                Turnus
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ExpenseFrequency)}
                className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.keys(FREQUENCY_LABELS) as ExpenseFrequency[]).map((f) => (
                  <option key={f} value={f}>
                    {FREQUENCY_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
              Kategorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
              Notiz <span className="text-gray-400 dark:text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionale Anmerkung"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {expense ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
