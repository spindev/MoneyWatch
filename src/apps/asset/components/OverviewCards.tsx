import React from 'react';
import type { Asset, AssetCategory } from '../types';
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CATEGORY_COLORS,
  ASSET_CATEGORY_BG,
  ASSET_CATEGORY_TEXT,
} from '../types';

interface OverviewCardsProps {
  assets: Asset[];
}

function fmt(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CATEGORIES: AssetCategory[] = ['tagesgeld', 'immobilien', 'genossenschaft', 'sonstiges'];

/** Minimum bar segment width (%) below which the percentage label is hidden */
const MIN_PCT_LABEL = 10;

export const OverviewCards: React.FC<OverviewCardsProps> = ({ assets }) => {
  const total = assets.reduce((sum, a) => sum + a.value, 0);

  const categoryTotals = CATEGORIES.reduce<Record<AssetCategory, number>>(
    (acc, cat) => {
      acc[cat] = assets.filter((a) => a.category === cat).reduce((s, a) => s + a.value, 0);
      return acc;
    },
    { tagesgeld: 0, immobilien: 0, genossenschaft: 0, sonstiges: 0 },
  );

  const activeCategories = CATEGORIES.filter((cat) => categoryTotals[cat] > 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h2 className="text-gray-900 dark:text-white font-semibold text-base">Übersicht</h2>
        <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
          Gesamtvermögen nach Anlagekategorie
        </p>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 dark:text-white text-sm font-medium">Gesamtvermögen</p>
            <p className="text-gray-500 dark:text-slate-400 text-xs">{assets.length} {assets.length === 1 ? 'Anlage' : 'Anlagen'}</p>
          </div>
        </div>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg tabular-nums">
          {fmt(total)} €
        </span>
      </div>

      {/* Category rows */}
      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {CATEGORIES.map((cat) => {
          const catTotal = categoryTotals[cat];
          const count = assets.filter((a) => a.category === cat).length;
          const pct = total > 0 ? (catTotal / total) * 100 : 0;
          return (
            <div key={cat} className="flex items-center justify-between px-4 sm:px-6 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${ASSET_CATEGORY_BG[cat]}`}>
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ASSET_CATEGORY_COLORS[cat] }}
                  />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white text-sm font-medium">
                    {ASSET_CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs">
                    {count} {count === 1 ? 'Anlage' : 'Anlagen'}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-semibold tabular-nums ${ASSET_CATEGORY_TEXT[cat]}`}>
                  {fmt(catTotal)} €
                </p>
                <p className="text-gray-400 dark:text-slate-500 text-xs tabular-nums">
                  {pct.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution bar */}
      {activeCategories.length > 0 && total > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-slate-700/30 rounded-b-2xl">
          <div className="h-5 rounded-full overflow-hidden flex">
            {activeCategories.map((cat, idx) => {
              const pct = (categoryTotals[cat] / total) * 100;
              const isLast = idx === activeCategories.length - 1;
              const barPct = isLast
                ? 100 - activeCategories.slice(0, idx).reduce((s, c) => s + (categoryTotals[c] / total) * 100, 0)
                : pct;
              return (
                <div
                  key={cat}
                  className="h-full transition-all duration-300 flex items-center justify-center"
                  style={{ width: `${barPct}%`, backgroundColor: ASSET_CATEGORY_COLORS[cat] }}
                >
                  {barPct >= MIN_PCT_LABEL && (
                    <span className="text-white text-xs font-medium px-1 truncate">
                      {pct.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} %
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            {activeCategories.map((cat) => (
              <span key={cat} className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: ASSET_CATEGORY_COLORS[cat] }} />
                {ASSET_CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
