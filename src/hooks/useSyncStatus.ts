import { useState, useEffect, useCallback, useRef } from 'react';
import {
  syncData,
  getLocalHash,
  type SyncStatus,
} from '../services/syncService';

/**
 * How long to wait after mount before the first sync attempt.
 * 2 s gives localStorage time to be read and the app to render.
 */
const INITIAL_DELAY_MS = 2_000;

/**
 * Periodic re-sync interval.
 * 60 s balances responsiveness with server load for a single-user app.
 */
const SYNC_INTERVAL_MS = 60_000;

/**
 * React hook that manages sync state for a MoneyWatch sub-app.
 *
 * Returns the current `SyncStatus` and a `triggerSync` callback that lets the
 * user manually kick off a sync (e.g. by clicking the indicator in the header).
 *
 * The hook automatically:
 *  - performs an initial sync after `INITIAL_DELAY_MS`
 *  - re-syncs every `SYNC_INTERVAL_MS`
 *  - marks status as 'pending' when local data changes between sync cycles
 */
export function useSyncStatus(): {
  syncStatus: SyncStatus;
  triggerSync: () => void;
} {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const lastLocalHashRef = useRef<string | null>(null);
  const isSyncingRef    = useRef(false);
  // Mirror syncStatus in a ref so the interval callback can read it without
  // being in its dependency array (avoids recreating the interval on every
  // status change).
  const syncStatusRef   = useRef<SyncStatus>('offline');
  syncStatusRef.current = syncStatus;

  const performSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setSyncStatus('syncing');

    const result = await syncData();
    setSyncStatus(result.status);
    if (result.hash) lastLocalHashRef.current = result.hash;

    isSyncingRef.current = false;
  }, []);

  // Initial sync after a short delay
  useEffect(() => {
    const id = setTimeout(performSync, INITIAL_DELAY_MS);
    return () => clearTimeout(id);
  }, [performSync]);

  // Periodic sync + detect local changes
  useEffect(() => {
    const id = setInterval(async () => {
      // Skip if a sync is already running
      if (isSyncingRef.current) return;

      // Check if local data changed since last sync and mark as pending
      const currentHash = await getLocalHash();
      if (
        lastLocalHashRef.current !== null &&
        currentHash !== lastLocalHashRef.current &&
        syncStatusRef.current !== 'offline'
      ) {
        setSyncStatus('pending');
      }

      performSync();
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(id);
    // performSync is stable (useCallback with no deps); intentionally omit
    // syncStatus to avoid recreating the interval on every status change.
  }, [performSync]);

  return { syncStatus, triggerSync: performSync };
}
