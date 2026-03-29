export type AssetCategory = 'tagesgeld' | 'immobilien' | 'genossenschaft' | 'sonstiges';

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  tagesgeld: 'Tagesgeld',
  immobilien: 'Immobilien',
  genossenschaft: 'Genossenschaftsanteile',
  sonstiges: 'Sonstiges',
};

export const ASSET_CATEGORY_COLORS: Record<AssetCategory, string> = {
  tagesgeld: '#3b82f6',
  immobilien: '#10b981',
  genossenschaft: '#8b5cf6',
  sonstiges: '#f59e0b',
};

export const ASSET_CATEGORY_BG: Record<AssetCategory, string> = {
  tagesgeld: 'bg-blue-100 dark:bg-blue-900/30',
  immobilien: 'bg-emerald-100 dark:bg-emerald-900/30',
  genossenschaft: 'bg-purple-100 dark:bg-purple-900/30',
  sonstiges: 'bg-amber-100 dark:bg-amber-900/30',
};

export const ASSET_CATEGORY_TEXT: Record<AssetCategory, string> = {
  tagesgeld: 'text-blue-600 dark:text-blue-400',
  immobilien: 'text-emerald-600 dark:text-emerald-400',
  genossenschaft: 'text-purple-600 dark:text-purple-400',
  sonstiges: 'text-amber-600 dark:text-amber-400',
};

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  /** Current value in € */
  value: number;
  /** Optional annual interest / yield rate in % */
  interestRate?: number;
  /** ISO date string (YYYY-MM-DD) – date of last update */
  date?: string;
  notes?: string;
}

export type Theme = 'dark' | 'light';

export interface Settings {
  theme: Theme;
}
