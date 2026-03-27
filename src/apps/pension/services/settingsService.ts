import type { Settings } from '../types';

const SETTINGS_KEY = 'pensionwatch_settings';

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  tax: {
    taxYear: 2024,
    hasChildren: true,
    statutorilyInsured: true,
    kvZusatzbeitrag: 1.7,
    kirchensteuer: false,
    kirchensteuerRate: 9,
  },
  retirementDate: '',
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
