import type { Settings } from '../types';

const SETTINGS_KEY = 'budgetwatch_settings';

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  netIncome: 0,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) as Partial<Settings> };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
