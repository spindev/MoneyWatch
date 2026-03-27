import React, { useState } from 'react';
import type { Expense, ExpenseFrequency } from '../types';
import { FREQUENCY_DIVISOR, FREQUENCY_LABELS } from '../types';

interface OverviewTableProps {
  netIncome: number;
  expenses: Expense[];
}

type Period = 'monthly' | 'quarterly' | 'yearly';

const PERIOD_LABELS: Record<Period, string> = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  yearly: 'Jährlich',
};

const PERIOD_MULTIPLIER: Record<Period, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

function fmt(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Minimum bar segment width (%) below which the percentage label is hidden */
const MIN_PCT_LABEL = 12;

function monthlyAmount(expense: Expense): number {
  return expense.amount / FREQUENCY_DIVISOR[expense.frequency as ExpenseFrequency];
}

export const OverviewTable: React.FC<OverviewTableProps> = ({ netIncome, expenses }) => {
  const [period, setPeriod] = useState<Period>('monthly');
  const [showInfo, setShowInfo] = useState(false);
  const multiplier = PERIOD_MULTIPLIER[period];

  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + monthlyAmount(e), 0);
  const periodIncome = netIncome * multiplier;
  const periodExpenses = totalMonthlyExpenses * multiplier;
  const remaining = periodIncome - periodExpenses;
  // Cap expenses at 100% so the two bar segments always sum to 100%
  const expensePct = periodIncome > 0 ? Math.min((periodExpenses / periodIncome) * 100, 100) : 0;
  const remainingPct = 100 - expensePct;

  return (
    <>
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">Übersicht</h2>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
              Alle Ausgaben auf den gewählten Zeitraum normalisiert
            </p>
          </div>
          {/* Info icon */}
          <button
            onClick={() => setShowInfo(true)}
            className="ml-1 w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
            aria-label="Details anzeigen"
            title="Details anzeigen"
          >
            <span className="text-xs font-bold leading-none">?</span>
          </button>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 self-start sm:self-auto">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {/* Income row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Netto-Einkommen</p>
              <p className="text-gray-500 dark:text-slate-400 text-xs">{PERIOD_LABELS[period]}</p>
            </div>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-base tabular-nums">
            + {fmt(periodIncome)} €
          </span>
        </div>

        {/* Expenses row */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
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
              </p>
            </div>
          </div>
          <span className="text-red-500 dark:text-red-400 font-semibold text-base tabular-nums">
            − {fmt(periodExpenses)} €
          </span>
        </div>

        {/* Remaining row */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 ${
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
                {periodIncome <= 0 ? 'Kein Einkommen hinterlegt' : (remaining >= 0 ? 'Freies Budget' : 'Budget überschritten')}
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

      {/* Dual-color progress bar */}
      {periodIncome > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-slate-700/30">
          <div className="h-5 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-red-500 transition-all duration-300 flex items-center justify-center"
              style={{ width: `${expensePct}%` }}
            >
              {expensePct >= MIN_PCT_LABEL && (
                <span className="text-white text-xs font-medium px-1 truncate">{fmtPct(expensePct)} %</span>
              )}
            </div>
            <div
              className="h-full bg-emerald-500 transition-all duration-300 flex items-center justify-center"
              style={{ width: `${remainingPct}%` }}
            >
              {remainingPct >= MIN_PCT_LABEL && (
                <span className="text-white text-xs font-medium px-1 truncate">{fmtPct(remainingPct)} %</span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              Ausgaben
            </span>
            <span className="flex items-center gap-1">
              Frei
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>
      )}
    </div>

    {/* Info modal – normalized values per expense */}
    {showInfo && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowInfo(false)}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-base">Ausgaben-Details</h3>
              <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">Normalisierte Werte pro Ausgabe</p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Schließen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto flex-1">
            {expenses.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-8">Keine Ausgaben vorhanden</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700/40 sticky top-0">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-gray-500 dark:text-slate-400 font-medium text-xs">Ausgabe</th>
                    <th className="text-right px-3 py-2.5 text-gray-500 dark:text-slate-400 font-medium text-xs">Monatlich</th>
                    <th className="text-right px-3 py-2.5 text-gray-500 dark:text-slate-400 font-medium text-xs">Quartalsweise</th>
                    <th className="text-right px-5 py-2.5 text-gray-500 dark:text-slate-400 font-medium text-xs">Jährlich</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {[...expenses]
                    .sort((a, b) => monthlyAmount(b) - monthlyAmount(a))
                    .map((e) => {
                      const mo = monthlyAmount(e);
                      return (
                        <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                          <td className="px-5 py-2.5">
                            <p className="text-gray-900 dark:text-white font-medium truncate max-w-[140px]">{e.name}</p>
                            <p className="text-gray-400 dark:text-slate-500 text-xs">{FREQUENCY_LABELS[e.frequency]}</p>
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-700 dark:text-slate-300 tabular-nums">{fmt(mo)} €</td>
                          <td className="px-3 py-2.5 text-right text-gray-700 dark:text-slate-300 tabular-nums">{fmt(mo * 3)} €</td>
                          <td className="px-5 py-2.5 text-right text-gray-700 dark:text-slate-300 tabular-nums">{fmt(mo * 12)} €</td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/40">
                  <tr>
                    <td className="px-5 py-2.5 text-gray-900 dark:text-white font-semibold text-xs">Gesamt</td>
                    <td className="px-3 py-2.5 text-right text-gray-900 dark:text-white font-semibold tabular-nums text-xs">{fmt(totalMonthlyExpenses)} €</td>
                    <td className="px-3 py-2.5 text-right text-gray-900 dark:text-white font-semibold tabular-nums text-xs">{fmt(totalMonthlyExpenses * 3)} €</td>
                    <td className="px-5 py-2.5 text-right text-gray-900 dark:text-white font-semibold tabular-nums text-xs">{fmt(totalMonthlyExpenses * 12)} €</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
