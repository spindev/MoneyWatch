import { useState, useEffect, useCallback, useRef } from 'react';
import {
  syncData,
  type SyncStatus,
} from '../services/syncService';

/**
 * How long to wait after mount before the first sync attempt.
 * 2 s gives localStorage time to be read and the app to render.
 */
const INITIAL_DELAY_MS = 2_000;

/**
 * React hook that manages sync state for a MoneyWatch sub-app.
 *
 * Returns the current `SyncStatus` and a `triggerSync` callback that lets the
 * user kick off a sync manually (by clicking the indicator in the header) or
 * programmatically (after data mutations in the app).
 *
 * The hook automatically performs an initial sync on mount (after a short
 * delay) so that a new browser session can restore data from the server.
 * No periodic polling is used – syncs only happen on demand.
 */
export function useSyncStatus(): {
  syncStatus: SyncStatus;
  triggerSync: () => void;
} {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const isSyncingRef = useRef(false);

  const performSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    const result = await syncData();
    setSyncStatus(result.status);

    isSyncingRef.current = false;
  }, []);

  // Initial sync after a short delay (enables first-launch data restore)
  useEffect(() => {
    const id = setTimeout(performSync, INITIAL_DELAY_MS);
    return () => clearTimeout(id);
  }, [performSync]);

  return { syncStatus, triggerSync: performSync };
}
