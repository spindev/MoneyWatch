import { useState, useEffect, useCallback, useRef } from 'react';
import {
  syncData,
  restoreFromServer,
  type SyncStatus,
} from '../services/syncService';

/**
 * How long to wait after mount before the first sync attempt.
 * 500 ms is enough for localStorage to be readable and the app to render,
 * while keeping the initial "pending" flash short.
 */
const INITIAL_DELAY_MS = 500;

/**
 * Module-level cache so that switching between sub-apps does not reset the
 * status indicator to 'offline' / 'pending' on every mount.
 */
let _cachedStatus: SyncStatus = 'pending';

/**
 * Module-level flag: user dismissed the restore prompt for this browser
 * session.  Resets on page reload (by design – a fresh page load should
 * re-evaluate whether a restore is available).
 */
let _restoreDismissed = false;

/**
 * React hook that manages sync state for a MoneyWatch sub-app.
 *
 * Returns the current `SyncStatus`, a `triggerSync` callback, a
 * `confirmRestore` callback (restore from server backup), and a
 * `dismissRestore` callback (ignore the restore prompt for this session).
 *
 * The hook automatically performs an initial sync on mount (after a short
 * delay) so that a new browser session can detect a server backup.
 * No periodic polling is used – syncs only happen on demand.
 */
export function useSyncStatus(): {
  syncStatus: SyncStatus;
  triggerSync: () => void;
  confirmRestore: () => Promise<void>;
  dismissRestore: () => void;
} {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(_cachedStatus);
  const isSyncingRef = useRef(false);

  const updateStatus = useCallback((status: SyncStatus) => {
    _cachedStatus = status;
    setSyncStatus(status);
  }, []);

  const performSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    updateStatus('syncing');

    const result = await syncData();

    // If the user already dismissed the restore prompt this session, treat
    // 'restore_available' as 'synced' (server backup is preserved, no push).
    if (result.status === 'restore_available' && _restoreDismissed) {
      updateStatus('synced');
    } else {
      updateStatus(result.status);
    }

    isSyncingRef.current = false;
  }, [updateStatus]);

  /** Restore all data from the server backup and reload the page. */
  const confirmRestore = useCallback(async () => {
    updateStatus('syncing');
    const hash = await restoreFromServer();
    if (hash === null) {
      updateStatus('error');
    } else {
      // Reload so all sub-app states are re-initialised from the restored
      // localStorage data.
      window.location.reload();
    }
  }, [updateStatus]);

  /** Dismiss the restore prompt for this browser session. */
  const dismissRestore = useCallback(() => {
    _restoreDismissed = true;
    updateStatus('synced');
  }, [updateStatus]);

  // Initial sync after a short delay (enables first-launch backup detection)
  useEffect(() => {
    const id = setTimeout(performSync, INITIAL_DELAY_MS);
    return () => clearTimeout(id);
  }, [performSync]);

  return { syncStatus, triggerSync: performSync, confirmRestore, dismissRestore };
}
