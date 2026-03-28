import { Settings } from '../types';

const STORAGE_KEY = 'portfoliowatch_settings';
const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  monthlySavings: 150,
  forecastYears: 30,
  forecastRatePessimistic: 3,
  forecastRateRealistic: 7,
  forecastRateOptimistic: 10,
};

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: Partial<Settings> = JSON.parse(raw);
    const theme = parsed.theme === 'dark' || parsed.theme === 'light'
      ? parsed.theme
      : DEFAULT_SETTINGS.theme;
    const monthlySavings =
      typeof parsed.monthlySavings === 'number' && parsed.monthlySavings >= 0
        ? parsed.monthlySavings
        : DEFAULT_SETTINGS.monthlySavings;
    const forecastYears =
      typeof parsed.forecastYears === 'number' && parsed.forecastYears >= 1 && parsed.forecastYears <= 100
        ? parsed.forecastYears
        : DEFAULT_SETTINGS.forecastYears;
    const forecastRatePessimistic =
      typeof parsed.forecastRatePessimistic === 'number' && parsed.forecastRatePessimistic >= 0 && parsed.forecastRatePessimistic <= 30
        ? parsed.forecastRatePessimistic
        : DEFAULT_SETTINGS.forecastRatePessimistic;
    const forecastRateRealistic =
      typeof parsed.forecastRateRealistic === 'number' && parsed.forecastRateRealistic >= 0 && parsed.forecastRateRealistic <= 30
        ? parsed.forecastRateRealistic
        : DEFAULT_SETTINGS.forecastRateRealistic;
    const forecastRateOptimistic =
      typeof parsed.forecastRateOptimistic === 'number' && parsed.forecastRateOptimistic >= 0 && parsed.forecastRateOptimistic <= 30
        ? parsed.forecastRateOptimistic
        : DEFAULT_SETTINGS.forecastRateOptimistic;
    return { theme, monthlySavings, forecastYears, forecastRatePessimistic, forecastRateRealistic, forecastRateOptimistic };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
