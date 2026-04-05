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

const MONTH_LABELS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

/** Returns the 0-indexed month (0 = Jan) from the expense's due date, defaulting to 0. */
function expenseDueMonth(expense: Expense): number {
  if (expense.date) return new Date(expense.date).getMonth();
  return 0;
}

function toPeriodEntry(label: string, ausgaben: number, einkommen: number): PeriodEntry {
  const rem = einkommen - ausgaben;
  return { label, ausgaben, einkommen, frei: rem >= 0 ? rem : 0, defizit: rem < 0 ? Math.abs(rem) : 0 };
}

/**
 * Builds per-slot data using actual payment timing.
 * - monthly expenses: appear in every month / quarter
 * - quarterly expenses: appear in the 4 months they actually fall (from due date)
 * - yearly expenses: appear only in the month / quarter they fall due
 */
function buildActualData(period: Period, expenses: Expense[], netIncome: number): PeriodEntry[] {
  if (period === 'monthly') {
    const ausgabenPerMonth = new Array(12).fill(0) as number[];
    for (const e of expenses) {
      const m = expenseDueMonth(e);
      if (e.frequency === 'monthly') {
        for (let i = 0; i < 12; i++) ausgabenPerMonth[i] += e.amount;
      } else if (e.frequency === 'quarterly') {
        for (let i = 0; i < 4; i++) ausgabenPerMonth[(m + i * 3) % 12] += e.amount;
      } else {
        ausgabenPerMonth[m] += e.amount;
      }
    }
    return MONTH_LABELS.map((label, idx) =>
      toPeriodEntry(label, ausgabenPerMonth[idx], netIncome),
    );
  }

  if (period === 'quarterly') {
    const ausgabenPerQuarter = new Array(4).fill(0) as number[];
    for (const e of expenses) {
      const q = Math.floor(expenseDueMonth(e) / 3);
      if (e.frequency === 'monthly') {
        for (let i = 0; i < 4; i++) ausgabenPerQuarter[i] += e.amount * 3;
      } else if (e.frequency === 'quarterly') {
        for (let i = 0; i < 4; i++) ausgabenPerQuarter[i] += e.amount;
      } else {
        ausgabenPerQuarter[q] += e.amount;
      }
    }
    return ['Q1', 'Q2', 'Q3', 'Q4'].map((label, idx) =>
      toPeriodEntry(label, ausgabenPerQuarter[idx], netIncome * 3),
    );
  }

  // yearly: single bar – full annual spend
  const ausgaben = expenses.reduce((sum, e) => sum + monthlyAmount(e) * 12, 0);
  return [toPeriodEntry(String(new Date().getFullYear()), ausgaben, netIncome * 12)];
}

const CHART_META: Record<ChartView, { title: string; description: string }> = {
  ausgaben: {
    title: 'Tatsächliche Ausgaben',
    description: 'Kosten werden zum jeweiligen Fälligkeitszeitraum erfasst, nicht normalisiert.',
  },
  ratio: {
    title: 'Einnahmen vs. Ausgaben',
    description: 'Frei verfügbares Budget nach tatsächlichen Zahlungen pro Zeitraum.',
  },
};

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

  const data = buildActualData(period, expenses, netIncome);
  const meta = CHART_META[view];

  if (expenses.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-700/30 rounded-b-2xl space-y-3">
      {/* Header: title + description + chart switcher */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">{meta.title}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{meta.description}</p>
        </div>
        <div className="flex gap-1 bg-gray-200 dark:bg-slate-600 rounded-lg p-0.5 flex-shrink-0">
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

      {/* Total expenses per period – actual payment timing */}
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

      {/* Stacked income/expenses ratio – actual payment timing */}
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
