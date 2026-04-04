import { createSettingsService } from '../../../lib/storage';
import type { Settings } from '../types';

const DEFAULT: Settings = {
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

const svc = createSettingsService<Settings>('pensionwatch_settings', DEFAULT);
export const loadSettings = svc.load;
export const saveSettings = svc.save;
