import type { PensionEntry } from '../types';

const PENSIONS_KEY = 'pensionwatch_pensions';

export function loadPensions(): PensionEntry[] {
  try {
    const raw = localStorage.getItem(PENSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PensionEntry[];
  } catch {
    return [];
  }
}

export function savePensions(pensions: PensionEntry[]): void {
  localStorage.setItem(PENSIONS_KEY, JSON.stringify(pensions));
}
