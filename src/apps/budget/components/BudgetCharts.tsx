import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type TooltipProps,
} from 'recharts';
import { type ValueType, type NameType } from 'recharts/types/component/DefaultTooltipContent';
import type { Expense } from '../types';
import { fmt } from '../../../lib/format';
import { monthlyAmount } from '../utils';

type Period = 'monthly' | 'quarterly' | 'yearly';

interface BudgetChartsProps {
  netIncome: number;
  expenses: Expense[];
  period: Period;
}

type ChartView = 'ausgaben' | 'ratio';

interface PeriodEntry {
  label: string;
  ausgaben: number;
  einkommen: number;
  frei: number;
  defizit: number;
}

// Generate one data entry per period unit (month / quarter / year)
function buildPeriodData(
  period: Period,
  totalMonthlyExpenses: number,
  netIncome: number,
): PeriodEntry[] {
  const slots: { label: string; multiplier: number }[] =
    period === 'monthly'
      ? ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'].map(
          (l) => ({ label: l, multiplier: 1 }),
        )
      : period === 'quarterly'
      ? ['Q1', 'Q2', 'Q3', 'Q4'].map((l) => ({ label: l, multiplier: 3 }))
      : [{ label: String(new Date().getFullYear()), multiplier: 12 }];

  return slots.map(({ label, multiplier }) => {
    const ausgaben = totalMonthlyExpenses * multiplier;
    const einkommen = netIncome * multiplier;
    const rem = einkommen - ausgaben;
    return {
      label,
      ausgaben,
      einkommen,
      frei: rem >= 0 ? rem : 0,
      defizit: rem < 0 ? Math.abs(rem) : 0,
    };
  });
}

// Compact € formatter for Y-axis ticks
const fmtY = (v: number): string => {
  if (Math.abs(v) >= 1000) {
    return `${(v / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })}k €`;
  }
  return `${v.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`;
};

// ── Ausgaben tooltip ─────────────────────────────────────────────────────────
const AusgabenTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-xs shadow-lg">
        <p className="text-gray-600 dark:text-slate-300 font-medium mb-0.5">{payload[0].payload.label}</p>
        <p className="text-red-500 dark:text-red-400">Ausgaben: {fmt(payload[0].value as number)} €</p>
      </div>
    );
  }
  return null;
};

// ── Verhältnis tooltip ────────────────────────────────────────────────────────
const RatioTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as PeriodEntry;
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-xs shadow-lg space-y-0.5">
        <p className="text-gray-600 dark:text-slate-300 font-medium mb-1">{d.label}</p>
        <p className="text-emerald-500">Einkommen: {fmt(d.einkommen)} €</p>
        <p className="text-red-500">Ausgaben: {fmt(d.ausgaben)} €</p>
        {d.defizit > 0
          ? <p className="text-orange-500">Defizit: {fmt(d.defizit)} €</p>
          : <p className="text-emerald-600">Frei: {fmt(d.frei)} €</p>
        }
      </div>
    );
  }
  return null;
};

export const BudgetCharts: React.FC<BudgetChartsProps> = ({ netIncome, expenses, period }) => {
  const [view, setView] = useState<ChartView>('ausgaben');

  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + monthlyAmount(e), 0);
  const data = buildPeriodData(period, totalMonthlyExpenses, netIncome);

  if (expenses.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-700/30 rounded-b-2xl space-y-3">
      {/* Chart switcher */}
      <div className="flex items-center justify-end">
        <div className="flex gap-1 bg-gray-200 dark:bg-slate-600 rounded-lg p-0.5">
          <button
            onClick={() => setView('ausgaben')}
            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
              view === 'ausgaben'
                ? 'bg-white dark:bg-slate-500 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Ausgaben
          </button>
          <button
            onClick={() => setView('ratio')}
            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
              view === 'ratio'
                ? 'bg-white dark:bg-slate-500 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Verhältnis
          </button>
        </div>
      </div>

      {/* Total expenses per period */}
      {view === 'ausgaben' && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.3)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={fmtY}
              width={60}
            />
            <Tooltip content={<AusgabenTooltip />} cursor={{ fill: 'rgba(156,163,175,0.1)' }} />
            <Bar dataKey="ausgaben" fill="#ef4444" radius={[4, 4, 0, 0]} name="Ausgaben" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Stacked income/expenses ratio – one bar per period unit */}
      {view === 'ratio' && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.3)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={fmtY}
              width={60}
            />
            <Tooltip content={<RatioTooltip />} cursor={{ fill: 'rgba(156,163,175,0.1)' }} />
            <Legend iconSize={8} iconType="square" wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="ausgaben" stackId="s" fill="#ef4444" radius={[0, 0, 0, 0]} name="Ausgaben" />
            <Bar dataKey="frei" stackId="s" fill="#10b981" radius={[4, 4, 0, 0]} name="Frei" />
            <Bar dataKey="defizit" stackId="s" fill="#f97316" radius={[4, 4, 0, 0]} name="Defizit" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
