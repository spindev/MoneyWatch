/**
 * backupService.ts
 *
 * Manual backup and restore of MoneyWatch localStorage data to/from the
 * backend SQLite store.  Only available when running inside Docker (i.e.
 * the custom Express server is present).  When running on GitHub Pages or
 * in plain `npm run dev` mode the API calls will fail and the status is
 * set to 'offline' so the app continues to work purely from localStorage.
 *
 * Backup and restore always operate on the keys of the currently active app
 * only, so switching apps does not overwrite unrelated data.
 */

export type AppId = 'portfolio' | 'pension' | 'budget' | 'asset';

/** localStorage keys that belong to each sub-app. */
export const APP_BACKUP_KEYS: Record<AppId, readonly string[]> = {
  portfolio: [
    'portfoliowatch_settings',
    'portfoliowatch_imported_lots',
    'portfoliowatch_imported_sales',
  ],
  pension: ['pensionwatch_settings', 'pensionwatch_pensions'],
  budget: ['budgetwatch_settings', 'budgetwatch_expenses'],
  asset: ['assetwatch_assets', 'assetwatch_settings'],
};

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

/**
 * Pushes the localStorage data of the given app to the server backup.
 * Only the keys belonging to `appId` are sent; other apps' data on the
 * server is left untouched.
 * Returns 'success', 'error', or 'offline' (server unreachable).
 */
export async function backupAppToServer(appId: AppId): Promise<BackupResult> {
  const keys = APP_BACKUP_KEYS[appId];
  const data: Record<string, string> = {};
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `scope` tells the server which keys belong to this backup so it can
      // remove keys that were intentionally deleted from localStorage.
      body: JSON.stringify({ data, scope: keys }),
    });
    return res.ok ? 'success' : 'error';
  } catch {
    return 'offline';
  }
}

/**
 * Restores the data of the given app from the server backup to localStorage.
 * Only the keys belonging to `appId` are written; other apps' data in
 * localStorage is left untouched.
 * Returns 'success', 'error', or 'offline' (server unreachable).
 * On success the caller should reload the page so the sub-app state is
 * re-initialised from the restored localStorage data.
 */
export async function restoreAppFromServer(appId: AppId): Promise<BackupResult> {
  const keys = APP_BACKUP_KEYS[appId];
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data`);
    if (!res.ok) return 'error';
    const json = (await res.json()) as { data: Record<string, string> };
    for (const key of keys) {
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
