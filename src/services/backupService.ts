/**
 * backupService.ts
 *
 * Manual backup and restore of MoneyWatch localStorage data to/from the
 * backend SQLite store.  Only available when running inside Docker (i.e.
 * the custom Express server is present).  When running on GitHub Pages or
 * in plain `npm run dev` mode the API calls will fail and the status is
 * set to 'offline' so the app continues to work purely from localStorage.
 */

export const BACKUP_KEYS: readonly string[] = [
  'moneywatch_active_app',
  'portfoliowatch_settings',
  'portfoliowatch_imported_lots',
  'portfoliowatch_imported_sales',
  'pensionwatch_settings',
  'pensionwatch_pensions',
  'budgetwatch_settings',
  'budgetwatch_expenses',
  'assetwatch_assets',
  'assetwatch_settings',
];

export type BackupResult = 'success' | 'error' | 'offline';

const API_BASE = '/api/sync';
const TIMEOUT_MS = 5000;

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function readLocalData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (const key of BACKUP_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }
  return data;
}

/**
 * Pushes all localStorage data to the server backup.
 * Returns 'success', 'error', or 'offline' (server unreachable).
 */
export async function backupToServer(): Promise<BackupResult> {
  try {
    const data = readLocalData();
    const res = await fetchWithTimeout(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return res.ok ? 'success' : 'error';
  } catch {
    return 'offline';
  }
}

/**
 * Restores all data from the server backup to localStorage.
 * Returns 'success', 'error', or 'offline' (server unreachable).
 * On success the caller should reload the page so all sub-app states
 * are re-initialised from the restored localStorage data.
 */
export async function restoreFromServer(): Promise<BackupResult> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data`);
    if (!res.ok) return 'error';
    const json = await res.json() as { hash: string; data: Record<string, string> };
    for (const key of BACKUP_KEYS) {
      const value = json.data[key];
      if (value !== undefined) {
        localStorage.setItem(key, value);
      }
    }
    return 'success';
  } catch {
    return 'offline';
  }
}
