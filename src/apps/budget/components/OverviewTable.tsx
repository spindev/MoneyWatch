import React, { useState, useRef, useEffect } from 'react';
import type { Expense, ExpenseFrequency } from '../types';
import { FREQUENCY_DIVISOR } from '../types';

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
  const [showExpenseBreakdown, setShowExpenseBreakdown] = useState(false);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const multiplier = PERIOD_MULTIPLIER[period];

  useEffect(() => {
    if (!showExpenseBreakdown) return;
    function handleClick(e: MouseEvent) {
      if (breakdownRef.current && !breakdownRef.current.contains(e.target as Node)) {
        setShowExpenseBreakdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExpenseBreakdown]);

  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + monthlyAmount(e), 0);
  const periodIncome = netIncome * multiplier;
  const periodExpenses = totalMonthlyExpenses * multiplier;
  const remaining = periodIncome - periodExpenses;
  // Cap expenses at 100% so the two bar segments always sum to 100%
  const expensePct = periodIncome > 0 ? Math.min((periodExpenses / periodIncome) * 100, 100) : 0;
  const remainingPct = 100 - expensePct;

  return (
    <>
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-gray-900 dark:text-white font-semibold text-base">Übersicht</h2>
          <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
            Alle Ausgaben auf den gewählten Zeitraum normalisiert
          </p>
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
        <div className="relative flex items-center justify-between px-4 sm:px-6 py-4" ref={breakdownRef}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-gray-900 dark:text-white text-sm font-medium">Gesamtausgaben</p>
                {/* Inline info button with compact expense breakdown popup */}
                <button
                  onClick={() => setShowExpenseBreakdown((v) => !v)}
                  className="w-4 h-4 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-none"
                  aria-label="Details zu Gesamtausgaben"
                >
                  ?
                </button>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-xs">
                {expenses.length} {expenses.length === 1 ? 'Ausgabe' : 'Ausgaben'}
              </p>
            </div>
          </div>
          <span className="text-red-500 dark:text-red-400 font-semibold text-base tabular-nums">
            − {fmt(periodExpenses)} €
          </span>
          {showExpenseBreakdown && (
            <div className="absolute left-0 top-full mt-1 z-50 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl p-3 space-y-2 text-xs">
              <p className="font-semibold text-gray-800 dark:text-white">
                Ausgaben {PERIOD_LABELS[period]}
              </p>
              {expenses.length === 0 ? (
                <p className="text-gray-500 dark:text-slate-400">Keine Ausgaben vorhanden</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...expenses]
                    .sort((a, b) => monthlyAmount(b) - monthlyAmount(a))
                    .map((e) => (
                      <div key={e.id} className="flex justify-between gap-2">
                        <span className="text-gray-500 dark:text-slate-400 truncate">{e.name}</span>
                        <span className="font-medium text-gray-800 dark:text-white tabular-nums flex-shrink-0">
                          {fmt(monthlyAmount(e) * multiplier)} €
                        </span>
                      </div>
                    ))}
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-slate-600 pt-1.5 flex justify-between font-semibold text-gray-800 dark:text-white">
                <span>Gesamt</span>
                <span className="tabular-nums">{fmt(periodExpenses)} €</span>
              </div>
            </div>
          )}
        </div>

        {/* Remaining row */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 ${
          remaining >= 0
            ? 'bg-emerald-50 dark:bg-emerald-900/10'
            : 'bg-red-50 dark:bg-red-900/10'
        }${periodIncome <= 0 ? ' rounded-b-2xl' : ''}`}>
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
        <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-slate-700/30 rounded-b-2xl">
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
    </>
  );
};
