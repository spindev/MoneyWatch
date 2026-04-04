import type { AppId } from '../components/appDefinitions';

export type { AppId };

export const APP_BACKUP_KEYS: Record<AppId, readonly string[]> = {
  portfolio: ['portfoliowatch_settings', 'portfoliowatch_imported_lots', 'portfoliowatch_imported_sales'],
  pension: ['pensionwatch_settings', 'pensionwatch_pensions'],
  budget: ['budgetwatch_settings', 'budgetwatch_expenses'],
  asset: ['assetwatch_assets', 'assetwatch_settings'],
};

export type BackupResult = 'success' | 'error' | 'offline';

const API_BASE = '/api/sync';
const TIMEOUT_MS = 5000;

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function backupAppToServer(appId: AppId): Promise<BackupResult> {
  const keys = APP_BACKUP_KEYS[appId];
  const data: Record<string, string> = {};
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, scope: keys }),
    });
    return res.ok ? 'success' : 'error';
  } catch {
    return 'offline';
  }
}

export async function restoreAppFromServer(appId: AppId): Promise<BackupResult> {
  const keys = APP_BACKUP_KEYS[appId];
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data`);
    if (!res.ok) return 'error';
    const json = (await res.json()) as { data: Record<string, string> };
    for (const key of keys) {
      const value = json.data[key];
      if (value !== undefined) localStorage.setItem(key, value);
    }
    return 'success';
  } catch {
    return 'offline';
  }
}
