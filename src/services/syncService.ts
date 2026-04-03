/**
 * syncService.ts
 *
 * Synchronises all MoneyWatch localStorage data with the backend SQLite store.
 * The sync API is only available when the app is running inside Docker (i.e. the
 * custom Express server is present).  When running on GitHub Pages or in plain
 * `npm run dev` mode the API calls will fail and the status is set to 'offline'
 * so the app continues to work purely from localStorage.
 *
 * Strategy: client always wins (push).  If the local store has no significant
 * data but the server has a backup, we return 'restore_available' so the user
 * can decide whether to restore.  Empty data is never pushed to the server to
 * protect the server backup from accidental overwrites.
 */

// All localStorage keys managed by MoneyWatch
export const SYNC_KEYS: readonly string[] = [
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

/**
 * Keys that contain actual user data (as opposed to configuration/settings).
 * Used to determine whether the local store has meaningful content worth
 * pushing to the server.
 *
 * NOTE: This list must be kept in sync with SYNC_KEYS above.  It contains all
 * SYNC_KEYS that are NOT pure settings/configuration keys.
 */
const DATA_KEYS: readonly string[] = [
  'portfoliowatch_imported_lots',
  'portfoliowatch_imported_sales',
  'pensionwatch_pensions',
  'budgetwatch_expenses',
  'assetwatch_assets',
];

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error' | 'pending' | 'restore_available';

// ── Hash ──────────────────────────────────────────────────────────────────────

/** Reads all sync keys from localStorage and returns a sorted key-value map. */
function readLocalData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (const key of SYNC_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }
  return data;
}

/** Checks whether there is any meaningful data stored locally. */
function hasLocalData(): boolean {
  return SYNC_KEYS.some((k) => localStorage.getItem(k) !== null);
}

/**
 * Checks whether any of the data keys (as opposed to settings keys) hold
 * non-trivial content.  An array is considered empty when it has no elements;
 * an object is considered empty when it has no own keys.
 *
 * This is used to guard against pushing empty data to the server after the
 * user clears all local data – the server backup should never be overwritten
 * with an empty dataset.
 */
function hasSignificantLocalData(): boolean {
  for (const key of DATA_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return true;
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        Object.keys(parsed as Record<string, unknown>).length > 0
      ) return true;
    } catch {
      if (raw.length > 0) return true;
    }
  }
  return false;
}

/** Computes a short SHA-256 hex hash of the sorted key-value data. */
async function computeHash(data: Record<string, string>): Promise<string> {
  const sorted = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  );
  const text = JSON.stringify(sorted);
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);
}

// ── API helpers ───────────────────────────────────────────────────────────────

const API_BASE = '/api/sync';
const TIMEOUT_MS = 5000;

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** Returns the hash stored on the server, or null if unreachable. */
export async function getServerHash(): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/hash`);
    if (!res.ok) return null;
    const json = await res.json() as { hash: string };
    return json.hash;
  } catch {
    return null;
  }
}

/** Pushes all local data to the server and returns the server's new hash. */
async function pushToServer(
  data: Record<string, string>
): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) return null;
    const json = await res.json() as { hash: string };
    return json.hash;
  } catch {
    return null;
  }
}

/** Pulls all data from the server and writes it to localStorage. */
async function pullFromServer(): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data`);
    if (!res.ok) return null;
    const json = await res.json() as { hash: string; data: Record<string, string> };
    for (const key of SYNC_KEYS) {
      const value = json.data[key];
      if (value !== undefined) {
        localStorage.setItem(key, value);
      }
    }
    return json.hash;
  } catch {
    return null;
  }
}

/**
 * Restores all data from the server to localStorage.
 * Returns the server hash on success or null on failure.
 */
export async function restoreFromServer(): Promise<string | null> {
  return pullFromServer();
}

// ── Main sync function ────────────────────────────────────────────────────────

export interface SyncResult {
  status: SyncStatus;
  /** The hash that both sides agree on after sync (or null on error/offline). */
  hash: string | null;
}

/**
 * Performs a full sync cycle:
 * 1. Check server reachability.
 * 2. Compare local hash with server hash.
 * 3. If local has no significant data → return 'restore_available' so the user
 *    can decide whether to restore (never overwrite server with empty data).
 * 4. If local has data that differs → push (client wins).
 * 5. Noop if hashes are equal.
 */
export async function syncData(): Promise<SyncResult> {
  const serverHash = await getServerHash();

  if (serverHash === null) {
    // Server unreachable – app runs offline from localStorage
    return { status: 'offline', hash: null };
  }

  const localData = readLocalData();
  const localHash = await computeHash(localData);

  if (localHash === serverHash) {
    return { status: 'synced', hash: localHash };
  }

  // Local store has no significant data → never push empty data to protect
  // the server backup; let the user decide whether to restore instead.
  if (!hasLocalData() || !hasSignificantLocalData()) {
    return { status: 'restore_available', hash: serverHash };
  }

  // Local has data that differs from server → push (client wins)
  const pushedHash = await pushToServer(localData);
  if (pushedHash === null) return { status: 'error', hash: null };
  return { status: 'synced', hash: pushedHash };
}

/**
 * Computes and returns only the local hash (no network call).
 * Useful to check cheaply whether local data has changed.
 */
export async function getLocalHash(): Promise<string> {
  return computeHash(readLocalData());
}
