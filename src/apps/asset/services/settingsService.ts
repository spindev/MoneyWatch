import { createSettingsService } from '../../../lib/storage';
import type { Settings } from '../types';

const DEFAULT: Settings = { theme: 'dark' };
const svc = createSettingsService<Settings>('assetwatch_settings', DEFAULT);
export const loadSettings = svc.load;
export const saveSettings = svc.save;
