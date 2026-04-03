import React, { useState } from 'react';
import { Settings, Theme } from '../types';
import { backupToServer, restoreFromServer, type BackupResult } from '../../../services/backupService';

interface SettingsPageProps {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  onClearPortfolio: () => void;
  onViewMarketData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSave, onClose, onClearPortfolio, onViewMarketData }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [monthlySavingsRaw, setMonthlySavingsRaw] = useState(String(settings.monthlySavings));
  const [forecastYearsRaw, setForecastYearsRaw] = useState(String(settings.forecastYears));
  const [backupState, setBackupState] = useState<BackupResult | 'idle' | 'loading'>('idle');
  const [restoreState, setRestoreState] = useState<BackupResult | 'idle' | 'loading'>('idle');
  const [confirmRestore, setConfirmRestore] = useState(false);

  const handleTheme = (theme: Theme) => {
    onSave({ ...settings, theme });
  };

  const handleMonthlySavingsBlur = () => {
    const val = parseFloat(monthlySavingsRaw.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      onSave({ ...settings, monthlySavings: val });
    } else {
      setMonthlySavingsRaw(String(settings.monthlySavings));
    }
  };

  const handleForecastYearsBlur = () => {
    const val = parseInt(forecastYearsRaw, 10);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      onSave({ ...settings, forecastYears: val });
    } else {
      setForecastYearsRaw(String(settings.forecastYears));
    }
  };

  const handleClearClick = () => {
    if (confirmClear) {
      onClearPortfolio();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const handleBackup = async () => {
    setBackupState('loading');
    const result = await backupToServer();
    setBackupState(result);
    if (result === 'success') {
      setTimeout(() => setBackupState('idle'), 3000);
    }
  };

  const handleRestoreClick = () => {
    setConfirmRestore(true);
  };

  const handleRestoreConfirm = async () => {
    setConfirmRestore(false);
    setRestoreState('loading');
    const result = await restoreFromServer();
    if (result === 'success') {
      window.location.reload();
    } else {
      setRestoreState(result);
      setTimeout(() => setRestoreState('idle'), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50"
      onClick={onClose}
    >
      <div
        className="absolute top-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Einstellungen</h2>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">PortfolioWatch konfigurieren</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-4 flex-shrink-0"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Darstellung</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleTheme('light')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${
                settings.theme === 'light'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 110 14A7 7 0 0112 5z" />
              </svg>
              Hell
            </button>
            <button
              onClick={() => handleTheme('dark')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${
                settings.theme === 'dark'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dunkel
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Marktdaten</p>
          <button
            onClick={onViewMarketData}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Kursdaten anzeigen
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Prognose</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-gray-600 dark:text-slate-400 text-xs">Sparrate (€/Monat)</span>
              <input
                type="number"
                min="0"
                step="any"
                value={monthlySavingsRaw}
                onChange={(e) => setMonthlySavingsRaw(e.target.value)}
                onBlur={handleMonthlySavingsBlur}
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-gray-600 dark:text-slate-400 text-xs">Anzahl Jahre</span>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={forecastYearsRaw}
                onChange={(e) => setForecastYearsRaw(e.target.value)}
                onBlur={handleForecastYearsBlur}
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Datenverwaltung</p>
          {confirmClear ? (
            <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 space-y-2">
              <p className="text-red-700 dark:text-red-300 text-xs">
                Alle importierten Käufe und Verkäufe werden unwiderruflich gelöscht. Fortfahren?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleClearClick}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Ja, löschen
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClearClick}
              className="w-full py-2 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Portfolio löschen
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Datensicherung</p>
          {confirmRestore ? (
            <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-2">
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Alle lokalen Daten werden mit dem Server-Backup überschrieben. Fortfahren?
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
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Ja, wiederherstellen
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleBackup}
                disabled={backupState === 'loading' || restoreState === 'loading'}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {backupState === 'loading' ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
                Backup
              </button>
              <button
                onClick={handleRestoreClick}
                disabled={backupState === 'loading' || restoreState === 'loading'}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {restoreState === 'loading' ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                )}
                Wiederherstellen
              </button>
            </div>
          )}
          {(backupState === 'success' || backupState === 'error' || backupState === 'offline') && (
            <p className={`text-xs ${backupState === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {backupState === 'success' && 'Backup erfolgreich erstellt.'}
              {backupState === 'error' && 'Backup fehlgeschlagen.'}
              {backupState === 'offline' && 'Server nicht verfügbar.'}
            </p>
          )}
          {(restoreState === 'error' || restoreState === 'offline') && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {restoreState === 'error' && 'Wiederherstellung fehlgeschlagen.'}
              {restoreState === 'offline' && 'Server nicht verfügbar.'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
