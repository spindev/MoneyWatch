import React from 'react';

export type AppId = 'portfolio' | 'pension' | 'budget' | 'asset';

export interface AppDefinition {
  id: AppId;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  /** Tailwind bg class for the app's primary color (e.g. 'bg-blue-600') */
  colorBg: string;
  /** Tailwind active-state bg class for the switcher highlight */
  colorActiveBg: string;
  /** Tailwind active-state text class for the switcher */
  colorActiveText: string;
  /** Tailwind checkmark icon color class */
  colorCheck: string;
}

export const APP_DEFINITIONS: AppDefinition[] = [
  {
    id: 'portfolio',
    name: 'PortfolioWatch',
    subtitle: 'ETF Portfolio Tracker',
    colorBg: 'bg-blue-600',
    colorActiveBg: 'bg-blue-50 dark:bg-blue-900/30',
    colorActiveText: 'text-blue-700 dark:text-blue-300',
    colorCheck: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'pension',
    name: 'PensionWatch',
    subtitle: 'Rentenübersicht',
    colorBg: 'bg-violet-600',
    colorActiveBg: 'bg-violet-50 dark:bg-violet-900/30',
    colorActiveText: 'text-violet-700 dark:text-violet-300',
    colorCheck: 'text-violet-600 dark:text-violet-400',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'budget',
    name: 'BudgetWatch',
    subtitle: 'Ausgabenverwaltung',
    colorBg: 'bg-amber-500',
    colorActiveBg: 'bg-amber-50 dark:bg-amber-900/30',
    colorActiveText: 'text-amber-700 dark:text-amber-300',
    colorCheck: 'text-amber-600 dark:text-amber-400',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'asset',
    name: 'AssetWatch',
    subtitle: 'Vermögensübersicht',
    colorBg: 'bg-emerald-600',
    colorActiveBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    colorActiveText: 'text-emerald-700 dark:text-emerald-300',
    colorCheck: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];
