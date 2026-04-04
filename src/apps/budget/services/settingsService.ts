import { createSettingsService } from '../../../lib/storage';
import type { Settings } from '../types';

const DEFAULT: Settings = { theme: 'dark', netIncome: 0 };
const svc = createSettingsService<Settings>('budgetwatch_settings', DEFAULT);
export const loadSettings = svc.load;
export const saveSettings = svc.save;
