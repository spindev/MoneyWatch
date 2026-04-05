import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from 'recharts';
import { type ValueType, type NameType } from 'recharts/types/component/DefaultTooltipContent';
import type { Expense } from '../types';
import { fmt } from '../../../lib/format';
import { monthlyAmount } from '../utils';

interface BudgetChartsProps {
  netIncome: number;
  expenses: Expense[];
  multiplier: number;
  periodLabel: string;
}

type ChartView = 'breakdown' | 'ratio';

const BreakdownTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-xs shadow-lg">
        <p className="text-gray-600 dark:text-slate-300 font-medium mb-0.5">{payload[0].payload.name}</p>
        <p className="text-red-500 dark:text-red-400">{fmt(payload[0].value as number)} €</p>
      </div>
    );
  }
  return null;
};

interface RatioEntry { name: string; amount: number; color: string }

const RatioTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload as RatioEntry;
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-xs shadow-lg">
        <p className="text-gray-600 dark:text-slate-300 font-medium mb-0.5">{entry.name}</p>
        <p style={{ color: entry.color }}>{fmt(payload[0].value as number)} €</p>
      </div>
    );
  }
  return null;
};

export const BudgetCharts: React.FC<BudgetChartsProps> = ({
  netIncome,
  expenses,
  multiplier,
  periodLabel,
}) => {
  const [view, setView] = useState<ChartView>('breakdown');

  const periodIncome = netIncome * multiplier;
  const periodExpenses = expenses.reduce((sum, e) => sum + monthlyAmount(e) * multiplier, 0);
  const remaining = periodIncome - periodExpenses;

  const breakdownData = [...expenses]
    .sort((a, b) => monthlyAmount(b) - monthlyAmount(a))
    .map((e) => ({
      name: e.name,
      amount: monthlyAmount(e) * multiplier,
    }));

  const ratioData: RatioEntry[] = [
    { name: 'Einkommen', amount: periodIncome, color: '#10b981' },
    { name: 'Ausgaben', amount: periodExpenses, color: '#ef4444' },
    {
      name: remaining >= 0 ? 'Frei' : 'Defizit',
      amount: Math.abs(remaining),
      color: remaining >= 0 ? '#3b82f6' : '#f97316',
    },
  ];

  if (expenses.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-700/30 rounded-b-2xl space-y-3">
      {/* Chart switcher */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {view === 'breakdown' ? `Ausgaben ${periodLabel}` : `Einnahmen / Ausgaben ${periodLabel}`}
        </span>
        <div className="flex gap-1 bg-gray-200 dark:bg-slate-600 rounded-lg p-0.5">
          <button
            onClick={() => setView('breakdown')}
            className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
              view === 'breakdown'
                ? 'bg-white dark:bg-slate-500 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Aufschlüsselung
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

      {/* Expense breakdown bar chart */}
      {view === 'breakdown' && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={breakdownData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.3)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval={0}
              angle={-35}
              textAnchor="end"
              tickFormatter={(v: string) => (v.length > 12 ? v.slice(0, 12) + '…' : v)}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v: number) => fmt(v)}
              width={64}
            />
            <Tooltip content={<BreakdownTooltip />} cursor={{ fill: 'rgba(156,163,175,0.1)' }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {breakdownData.map((_, idx) => (
                <Cell
                  key={idx}
                  fill="#ef4444"
                  fillOpacity={Math.max(0.4, 0.85 - idx * 0.04)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Income vs Expenses ratio bar chart */}
      {view === 'ratio' && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={ratioData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.3)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v: number) => fmt(v)}
              width={64}
            />
            <Tooltip content={<RatioTooltip />} cursor={{ fill: 'rgba(156,163,175,0.1)' }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {ratioData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
