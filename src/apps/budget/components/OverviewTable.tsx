import React from 'react';
import type { Expense } from '../types';
import { FREQUENCY_DIVISOR } from '../types';

interface OverviewTableProps {
  netIncome: number;
  expenses: Expense[];
}

function fmt(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthlyAmount(expense: Expense): number {
  return expense.amount / FREQUENCY_DIVISOR[expense.frequency];
}

export const OverviewTable: React.FC<OverviewTableProps> = ({ netIncome, expenses }) => {
  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + monthlyAmount(e), 0);
  const remaining = netIncome - totalMonthlyExpenses;
  const remainingPct = netIncome > 0 ? (remaining / netIncome) * 100 : 0;
  const expensePct = netIncome > 0 ? (totalMonthlyExpenses / netIncome) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-gray-900 dark:text-white font-semibold text-base">Monatliche Übersicht</h2>
        <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
          Alle Ausgaben auf monatliche Basis normalisiert
        </p>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {/* Income row */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Netto-Einkommen</p>
              <p className="text-gray-500 dark:text-slate-400 text-xs">Monatlich</p>
            </div>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-base tabular-nums">
            + {fmt(netIncome)} €
          </span>
        </div>

        {/* Expenses row */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Gesamtausgaben</p>
              <p className="text-gray-500 dark:text-slate-400 text-xs">
                {expenses.length} {expenses.length === 1 ? 'Ausgabe' : 'Ausgaben'}
                {netIncome > 0 && (
                  <span className="ml-1">· {fmt(expensePct)} % des Einkommens</span>
                )}
              </p>
            </div>
          </div>
          <span className="text-red-500 dark:text-red-400 font-semibold text-base tabular-nums">
            − {fmt(totalMonthlyExpenses)} €
          </span>
        </div>

        {/* Remaining row */}
        <div className={`flex items-center justify-between px-6 py-4 ${
          remaining >= 0
            ? 'bg-emerald-50 dark:bg-emerald-900/10'
            : 'bg-red-50 dark:bg-red-900/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              remaining >= 0
                ? 'bg-emerald-100 dark:bg-emerald-900/40'
                : 'bg-red-100 dark:bg-red-900/40'
            }`}>
              <svg
                className={`w-4 h-4 ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-semibold">
                {remaining >= 0 ? 'Verbleibendes Budget' : 'Defizit'}
              </p>
              <p className="text-gray-500 dark:text-slate-400 text-xs">
                {netIncome > 0
                  ? `${fmt(Math.abs(remainingPct))} % ${remaining >= 0 ? 'verbleiben' : 'Überziehung'}`
                  : 'Kein Einkommen hinterlegt'}
              </p>
            </div>
          </div>
          <span className={`font-bold text-lg tabular-nums ${
            remaining >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-400'
          }`}>
            {remaining >= 0 ? '' : '−'}{fmt(Math.abs(remaining))} €
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {netIncome > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-700/30">
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5">
            <span>Ausgaben-Anteil</span>
            <span>{fmt(Math.min(expensePct, 100))} %</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                expensePct > 100
                  ? 'bg-red-500'
                  : expensePct > 80
                  ? 'bg-orange-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(expensePct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
