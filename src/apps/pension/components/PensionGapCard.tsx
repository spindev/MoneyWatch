import React from 'react';

interface PensionGapCardProps {
  netPensionMonthly: number;
}

function fmt(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Read the monthly net income stored by BudgetWatch from localStorage. */
function loadBudgetNetIncome(): number {
  try {
    const raw = localStorage.getItem('budgetwatch_settings');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { netIncome?: unknown };
    return typeof parsed.netIncome === 'number' && parsed.netIncome > 0
      ? parsed.netIncome
      : 0;
  } catch {
    return 0;
  }
}

export const PensionGapCard: React.FC<PensionGapCardProps> = ({ netPensionMonthly }) => {
  const currentNetIncome = loadBudgetNetIncome();

  if (currentNetIncome <= 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-1.5L12 21l3.5-1.5L19 21z" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Rentenlücke</h3>
        </div>
        <p className="text-gray-500 dark:text-slate-400 text-xs">
          Hinterlege dein monatliches Netto-Einkommen in <span className="font-medium">BudgetWatch → Einstellungen</span>, um deine Rentenlücke zu berechnen.
        </p>
      </div>
    );
  }

  const gap = currentNetIncome - netPensionMonthly;
  const gapPct = (gap / currentNetIncome) * 100;
  const pensionRatio = Math.min((netPensionMonthly / currentNetIncome) * 100, 100);
  const hasGap = gap > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-1.5L12 21l3.5-1.5L19 21z" />
          </svg>
        </div>
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Rentenlücke</h3>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-gray-500 dark:text-slate-400 text-xs mb-0.5">Aktuelles Einkommen</p>
          <p className="text-gray-900 dark:text-white font-semibold text-sm tabular-nums">{fmt(currentNetIncome)} €</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-slate-400 text-xs mb-0.5">Netto-Rente</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm tabular-nums">{fmt(netPensionMonthly)} €</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-slate-400 text-xs mb-0.5">{hasGap ? 'Lücke' : 'Überschuss'}</p>
          <p className={`font-semibold text-sm tabular-nums ${hasGap ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {hasGap ? '−' : '+'}{fmt(Math.abs(gap))} €
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-4 rounded-full overflow-hidden bg-red-100 dark:bg-red-900/30 flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 flex items-center justify-center"
            style={{ width: `${pensionRatio}%` }}
          >
            {pensionRatio >= 20 && (
              <span className="text-white text-[10px] font-medium px-1 truncate">{fmtPct(pensionRatio)} %</span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Rente ({fmtPct(pensionRatio)} %)
          </span>
          {hasGap && (
            <span className="flex items-center gap-1">
              Lücke {fmtPct(gapPct)} %
              <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
            </span>
          )}
        </div>
      </div>

      {/* Hint */}
      {hasGap && (
        <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">
          Deine erwartete Netto-Rente deckt <span className="font-medium text-gray-700 dark:text-slate-200">{fmtPct(pensionRatio)} %</span> deines aktuellen Einkommens. Die Lücke von <span className="font-medium text-red-500 dark:text-red-400">{fmt(gap)} € / Monat</span> sollte durch ETF-Sparplan oder andere Vorsorge gedeckt werden.
        </p>
      )}
    </div>
  );
};
