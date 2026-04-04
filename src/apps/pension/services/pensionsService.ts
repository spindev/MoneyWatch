import { createListStorage } from '../../../lib/storage';
import type { PensionEntry } from '../types';

const svc = createListStorage<PensionEntry>('pensionwatch_pensions');
export const loadPensions = svc.load;
export const savePensions = svc.save;
