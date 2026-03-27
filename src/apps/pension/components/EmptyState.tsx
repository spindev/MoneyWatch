import React from 'react';
import { PENSION_TYPE_COLORS, PENSION_TYPE_LABELS } from '../types';
import type { PensionType } from '../types';

interface EmptyStateProps {
  onAddPension: () => void;
}

const features: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Alle Rentenarten',
    desc: 'Gesetzlich, Rürup, Betrieblich & Riester an einem Ort',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    title: 'Steuerberechnung',
    desc: 'ESt und KV/PV-Abzüge automatisch berechnet',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Lokal & privat',
    desc: 'Alle Daten bleiben ausschließlich in deinem Browser',
  },
];

const pensionTypes: { type: PensionType; example: string }[] = [
  { type: 'gesetzlich', example: '1.450 €/Monat' },
  { type: 'ruerup', example: '320 €/Monat' },
  { type: 'betrieblich', example: '280 €/Monat' },
  { type: 'riester', example: '180 €/Monat' },
  { type: 'etf', example: '500 €/Monat' },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddPension }) => {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-9 h-9 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-gray-900 dark:text-white text-xl font-bold">
            Willkommen bei PensionWatch
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
            Erfasse alle deine Rentenquellen und sieh auf einen Blick, was nach Steuern und
            Sozialabgaben von deiner Rente übrig bleibt.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onAddPension}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Erste Rente hinzufügen
          </button>
        </div>
      </div>

      {/* Feature cards + pension type chips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Features */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Was PensionWatch kann</h3>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                  {f.icon}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white text-sm font-medium">{f.title}</p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported pension types */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm">Unterstützte Rentenarten</h3>
          <div className="space-y-2">
            {pensionTypes.map(({ type, example }) => (
              <div
                key={type}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-slate-700/50"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PENSION_TYPE_COLORS[type] }}
                  />
                  <span className="text-gray-900 dark:text-white text-sm">
                    {PENSION_TYPE_LABELS[type]}
                  </span>
                </div>
                <span className="text-gray-400 dark:text-slate-500 text-xs tabular-nums">
                  Bsp. {example}
                </span>
              </div>
            ))}
          </div>
          <p className="text-gray-400 dark:text-slate-500 text-xs">
            + Private Rente (Ertragsanteilbesteuerung)
          </p>
        </div>
      </div>
    </div>
  );
};
