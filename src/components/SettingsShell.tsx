import React, { useState } from 'react';
import { BackupSection } from './BackupSection';
import type { AppId } from './appDefinitions';

interface SettingsShellProps {
  appId: AppId;
  subtitle: string;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  onClose: () => void;
  onClearData: () => void;
  clearLabel: string;
  clearMessage: string;
  children?: React.ReactNode;
  activeColorClass: string;
}

export const SettingsShell: React.FC<SettingsShellProps> = ({
  appId,
  subtitle,
  theme,
  onThemeChange,
  onClose,
  onClearData,
  clearLabel,
  clearMessage,
  children,
  activeColorClass,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearClick = () => {
    if (confirmClear) {
      onClearData();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const themeBtn = (value: 'light' | 'dark', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => onThemeChange(value)}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 ${
        theme === value
          ? `${activeColorClass} text-white`
          : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}>
      <div
        className="absolute top-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-2xl space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Einstellungen</h2>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">{subtitle}</p>
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
            {themeBtn(
              'light',
              'Hell',
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 110 14A7 7 0 0112 5z" />
              </svg>,
            )}
            {themeBtn(
              'dark',
              'Dunkel',
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>,
            )}
          </div>
        </div>

        {children}

        <div className="space-y-2">
          <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Datenverwaltung</p>
          <BackupSection appId={appId} />
          {confirmClear ? (
            <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-3 space-y-2">
              <p className="text-red-700 dark:text-red-300 text-xs">{clearMessage}</p>
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
              {clearLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
