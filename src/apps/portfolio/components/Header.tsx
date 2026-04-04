import React, { useRef } from 'react';
import { AppHeader } from '../../../components/AppHeader';
import type { AppId } from '../../../components/AppHeader';

interface HeaderProps {
  page: 'portfolio' | 'settings';
  onNavigate: (page: 'portfolio' | 'settings') => void;
  isLoading: boolean;
  hasError: boolean;
  onCsvUpload?: (file: File) => void;
  onManualBuy?: () => void;
  activeApp: AppId;
  onSwitchApp: (app: AppId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  page,
  onNavigate,
  isLoading,
  hasError,
  onCsvUpload,
  onManualBuy,
  activeApp,
  onSwitchApp,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCsvUpload) onCsvUpload(file);
    e.target.value = '';
  };

  return (
    <AppHeader
      activeApp={activeApp}
      onSwitchApp={onSwitchApp}
      isSettingsActive={page === 'settings'}
      onSettings={() => onNavigate(page === 'settings' ? 'portfolio' : 'settings')}
      statusIndicator={
        isLoading && !hasError ? (
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0" />
        ) : hasError ? (
          <span className="text-red-500 dark:text-red-400">Fehler beim Abrufen der Kurse</span>
        ) : null
      }
      actions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            aria-label="CSV-Datei auswählen"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="CSV importieren"
            title="CSV importieren"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button
            onClick={onManualBuy}
            className="p-2 rounded-lg transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Kauf manuell eintragen"
            title="Kauf manuell eintragen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </>
      }
    />
  );
};
