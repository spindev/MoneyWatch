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
  LabelList,
  Legend,
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

const PERIODS = [
  { label: 'Monatlich', multiplier: 1 },
  { label: 'Vierteljährlich', multiplier: 3 },
  { label: 'Jährlich', multiplier: 12 },
] as const;

// ── Breakdown tooltip ────────────────────────────────────────────────────────
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

// ── Stacked ratio tooltip ────────────────────────────────────────────────────
interface StackedEntry { period: string; ausgaben: number; frei: number; defizit: number; einkommen: number }

const RatioTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload as StackedEntry;
    const hasDefizit = d.defizit > 0;
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg p-2 text-xs shadow-lg space-y-0.5">
        <p className="text-gray-600 dark:text-slate-300 font-medium mb-1">{d.period}</p>
        <p className="text-emerald-500">Einkommen: {fmt(d.einkommen)} €</p>
        <p className="text-red-500">Ausgaben: {fmt(d.ausgaben)} €</p>
        {hasDefizit
          ? <p className="text-orange-500">Defizit: {fmt(d.defizit)} €</p>
          : <p className="text-blue-500">Frei: {fmt(d.frei)} €</p>
        }
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

  const totalMonthlyExpenses = expenses.reduce((sum, e) => sum + monthlyAmount(e), 0);

  // Breakdown data for the selected period
  const breakdownData = [...expenses]
    .sort((a, b) => monthlyAmount(b) - monthlyAmount(a))
    .map((e) => ({
      name: e.name,
      amount: monthlyAmount(e) * multiplier,
    }));

  // Stacked ratio data for all three periods
  const stackedData: StackedEntry[] = PERIODS.map(({ label, multiplier: m }) => {
    const inc = netIncome * m;
    const exp = totalMonthlyExpenses * m;
    const rem = inc - exp;
    return {
      period: label,
      einkommen: inc,
      ausgaben: exp,
      frei: rem >= 0 ? rem : 0,
      defizit: rem < 0 ? Math.abs(rem) : 0,
    };
  });

  if (expenses.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-700/30 rounded-b-2xl space-y-3">
      {/* Chart switcher */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {view === 'breakdown' ? `Ausgaben ${periodLabel}` : 'Einnahmen / Ausgaben'}
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
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={breakdownData} margin={{ top: 18, right: 8, left: 0, bottom: 24 }}>
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
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(v: number) => fmt(v)}
                style={{ fontSize: 9, fill: '#6b7280' }}
              />
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

      {/* Stacked income/expenses ratio chart – one group per period */}
      {view === 'ratio' && (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={stackedData} margin={{ top: 18, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.3)" />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v: number) => fmt(v)}
              width={64}
            />
            <Tooltip content={<RatioTooltip />} cursor={{ fill: 'rgba(156,163,175,0.1)' }} />
            <Legend
              iconSize={8}
              iconType="square"
              formatter={(value) =>
                value === 'ausgaben' ? 'Ausgaben' :
                value === 'frei' ? 'Frei' : 'Defizit'
              }
              wrapperStyle={{ fontSize: 10 }}
            />
            {/* Ausgaben – always shown, bottom segment */}
            <Bar dataKey="ausgaben" stackId="ratio" fill="#ef4444" radius={[0, 0, 0, 0]} name="ausgaben">
              <LabelList
                dataKey="ausgaben"
                position="inside"
                formatter={(v: number) => (v > 0 ? fmt(v) : '')}
                style={{ fontSize: 9, fill: '#fff' }}
              />
            </Bar>
            {/* Frei – top segment when budget positive */}
            <Bar dataKey="frei" stackId="ratio" fill="#3b82f6" radius={[4, 4, 0, 0]} name="frei">
              <LabelList
                dataKey="frei"
                position="top"
                formatter={(v: number) => (v > 0 ? fmt(v) : '')}
                style={{ fontSize: 9, fill: '#6b7280' }}
              />
            </Bar>
            {/* Defizit – top segment when budget exceeded */}
            <Bar dataKey="defizit" stackId="ratio" fill="#f97316" radius={[4, 4, 0, 0]} name="defizit">
              <LabelList
                dataKey="defizit"
                position="top"
                formatter={(v: number) => (v > 0 ? fmt(v) : '')}
                style={{ fontSize: 9, fill: '#6b7280' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
