import React, { useState, useRef, useEffect } from 'react';
import type { SyncStatus } from '../services/syncService';

interface SyncStatusProps {
  status: SyncStatus;
  /** Called when the user clicks the indicator to trigger a manual sync. */
  onSync?: () => void;
  /** Called when the user confirms restoring data from the server backup. */
  onRestore?: () => void;
  /** Called when the user dismisses the restore prompt for this session. */
  onDismissRestore?: () => void;
}

/**
 * Compact sync-status indicator shown in each app header.
 * Always visible so the user can see offline/online state at a glance.
 *
 * When status is 'restore_available', clicking the indicator opens an inline
 * confirmation dialog asking the user whether to restore the server backup.
 */
export const SyncStatusIndicator: React.FC<SyncStatusProps> = ({
  status,
  onSync,
  onRestore,
  onDismissRestore,
}) => {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close the dialog when clicking outside of it
  useEffect(() => {
    if (!showRestoreDialog) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setShowRestoreDialog(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRestoreDialog]);

  // Close dialog when status changes away from restore_available
  useEffect(() => {
    if (status !== 'restore_available') {
      setShowRestoreDialog(false);
    }
  }, [status]);

  const label: Record<SyncStatus, string> = {
    offline:          'Offline – kein Server verfügbar',
    syncing:          'Synchronisiere…',
    synced:           'Synchronisiert',
    error:            'Sync fehlgeschlagen',
    pending:          'Sync ausstehend',
    restore_available: 'Server-Backup verfügbar – klicken zum Wiederherstellen',
  };

  const colorClass: Record<SyncStatus, string> = {
    offline:          'text-gray-400 dark:text-slate-600',
    syncing:          'text-blue-500 dark:text-blue-400',
    synced:           'text-emerald-500 dark:text-emerald-400',
    error:            'text-red-500 dark:text-red-400',
    pending:          'text-amber-500 dark:text-amber-400',
    restore_available: 'text-violet-500 dark:text-violet-400',
  };

  const handleClick = () => {
    if (status === 'restore_available') {
      setShowRestoreDialog(true);
    } else {
      onSync?.();
    }
  };

  return (
    <div className="relative" ref={dialogRef}>
      <button
        onClick={handleClick}
        title={label[status]}
        aria-label={label[status]}
        className={`p-2 rounded-lg transition-colors ${colorClass[status]} hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none`}
      >
        {status === 'offline' ? (
          /* Cloud with X – no server available */
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3l18 18M9.879 9.879A3 3 0 006.01 13H6a3 3 0 000 6h.01M18 13h.01A3 3 0 0018 7a5 5 0 00-9.9-1M15 13l-3 3m0 0l-3-3m3 3V9"
            />
          </svg>
        ) : status === 'syncing' ? (
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
        ) : status === 'restore_available' ? (
          /* Cloud download – backup available */
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
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

      {/* Restore confirmation dialog */}
      {showRestoreDialog && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg p-4 z-50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Server-Backup gefunden
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Lokal sind keine Daten vorhanden, aber auf dem Server liegt ein Backup. Soll es wiederhergestellt werden?
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowRestoreDialog(false);
                onRestore?.();
              }}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              Wiederherstellen
            </button>
            <button
              onClick={() => {
                setShowRestoreDialog(false);
                onDismissRestore?.();
              }}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 transition-colors"
            >
              Ignorieren
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
