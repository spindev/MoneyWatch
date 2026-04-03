import React from 'react';
import type { SyncStatus } from '../services/syncService';

interface SyncStatusProps {
  status: SyncStatus;
  /** Called when the user clicks the indicator to trigger a manual sync. */
  onSync?: () => void;
}

/**
 * Compact sync-status indicator shown in each app header.
 * Invisible when running without the backend (status === 'offline').
 */
export const SyncStatusIndicator: React.FC<SyncStatusProps> = ({
  status,
  onSync,
}) => {
  if (status === 'offline') return null;

  const label: Record<SyncStatus, string> = {
    offline: '',
    syncing: 'Synchronisiere…',
    synced:  'Synchronisiert',
    error:   'Sync fehlgeschlagen',
    pending: 'Sync ausstehend',
  };

  const colorClass: Record<SyncStatus, string> = {
    offline: '',
    syncing: 'text-blue-500 dark:text-blue-400',
    synced:  'text-emerald-500 dark:text-emerald-400',
    error:   'text-red-500 dark:text-red-400',
    pending: 'text-amber-500 dark:text-amber-400',
  };

  return (
    <button
      onClick={onSync}
      title={label[status]}
      aria-label={label[status]}
      className={`p-2 rounded-lg transition-colors ${colorClass[status]} hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none`}
    >
      {status === 'syncing' ? (
        /* Animated spinner */
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ) : status === 'synced' ? (
        /* Cloud with checkmark */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : status === 'error' ? (
        /* Warning */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ) : (
        /* Pending – cloud upload */
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      )}
    </button>
  );
};
