import { createSettingsService } from '../../../lib/storage';
import type { Settings } from '../types';

const DEFAULT: Settings = { theme: 'dark', monthlySavings: 150, forecastYears: 30 };
const svc = createSettingsService<Settings>('portfoliowatch_settings', DEFAULT);
export const getSettings = svc.load;
export const saveSettings = svc.save;
