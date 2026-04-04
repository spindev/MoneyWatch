import React, { useState } from 'react';
import { backupAppToServer, restoreAppFromServer, type AppId, type BackupResult } from '../services/backupService';

interface BackupSectionProps {
  appId: AppId;
}

const COLORS: Record<AppId, { btn: string; panel: string; text: string; confirmBtn: string }> = {
  portfolio: {
    btn: 'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    panel: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    confirmBtn: 'bg-blue-600 hover:bg-blue-700',
  },
  pension: {
    btn: 'border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20',
    panel: 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-700 dark:text-violet-300',
    confirmBtn: 'bg-violet-600 hover:bg-violet-700',
  },
  budget: {
    btn: 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    panel: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-300',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600',
  },
  asset: {
    btn: 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    panel: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export const BackupSection: React.FC<BackupSectionProps> = ({ appId }) => {
  const [backupState, setBackupState] = useState<BackupResult | 'idle' | 'loading'>('idle');
  const [restoreState, setRestoreState] = useState<BackupResult | 'idle' | 'loading'>('idle');
  const [confirmRestore, setConfirmRestore] = useState(false);

  if (import.meta.env.VITE_IS_DOCKER !== 'true') return null;

  const c = COLORS[appId];
  const isLoading = backupState === 'loading' || restoreState === 'loading';

  const handleBackup = async () => {
    setBackupState('loading');
    const result = await backupAppToServer(appId);
    setBackupState(result);
    if (result === 'success') setTimeout(() => setBackupState('idle'), 3000);
  };

  const handleRestoreConfirm = async () => {
    setConfirmRestore(false);
    setRestoreState('loading');
    const result = await restoreAppFromServer(appId);
    if (result === 'success') {
      window.location.reload();
    } else {
      setRestoreState(result);
      setTimeout(() => setRestoreState('idle'), 3000);
    }
  };

  const spinner = (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  return (
    <div className="space-y-2">
      {confirmRestore ? (
        <div className={`rounded-lg border p-3 space-y-2 ${c.panel}`}>
          <p className={`text-xs ${c.text}`}>
            Die lokalen Daten dieser App werden mit dem Server-Backup überschrieben. Fortfahren?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmRestore(false)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleRestoreConfirm}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${c.confirmBtn}`}
            >
              Ja, wiederherstellen
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleBackup}
            disabled={isLoading}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 disabled:opacity-50 ${c.btn}`}
          >
            {backupState === 'loading' ? spinner : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            Backup
          </button>
          <button
            onClick={() => setConfirmRestore(true)}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {restoreState === 'loading' ? spinner : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            )}
            Wiederherstellen
          </button>
        </div>
      )}
      {backupState !== 'idle' && backupState !== 'loading' && (
        <p className={`text-xs ${backupState === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {backupState === 'success' ? 'Backup erfolgreich erstellt.' : backupState === 'error' ? 'Backup fehlgeschlagen.' : 'Server nicht verfügbar.'}
        </p>
      )}
      {(restoreState === 'error' || restoreState === 'offline') && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {restoreState === 'error' ? 'Wiederherstellung fehlgeschlagen.' : 'Server nicht verfügbar.'}
        </p>
      )}
    </div>
  );
};
