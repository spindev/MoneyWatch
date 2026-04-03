import React, { useState } from 'react';
import { AppSwitcher, APP_DEFINITIONS } from '../../../components/AppSwitcher';
import type { AppId } from '../../../components/AppSwitcher';
import { SyncStatusIndicator } from '../../../components/SyncStatus';
import type { SyncStatus } from '../../../services/syncService';

type Page = 'dashboard' | 'settings';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
  onAddExpense: () => void;
  activeApp: AppId;
  onSwitchApp: (app: AppId) => void;
  syncStatus?: SyncStatus;
  onSync?: () => void;
  onRestore?: () => void;
  onDismissRestore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  page,
  onNavigate,
  onAddExpense,
  activeApp,
  onSwitchApp,
  syncStatus = 'pending',
  onSync,
  onRestore,
  onDismissRestore,
}) => {
  const [showSwitcher, setShowSwitcher] = useState(false);

  const currentApp = APP_DEFINITIONS.find((a) => a.id === activeApp);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo + app switcher */}
        <div className="relative">
          <button
            onClick={() => setShowSwitcher((v) => !v)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="Anwendung wechseln"
            aria-expanded={showSwitcher}
          >
            <div className={`w-8 h-8 ${currentApp?.colorBg ?? 'bg-amber-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {currentApp?.icon ?? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="text-left">
              <h1 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">BudgetWatch</h1>
              <p className="text-gray-500 dark:text-slate-400 text-xs">Ausgabenverwaltung</p>
            </div>
          </button>
          {showSwitcher && (
            <AppSwitcher
              activeApp={activeApp}
              onSelect={onSwitchApp}
              onClose={() => setShowSwitcher(false)}
            />
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAddExpense}
            className="p-2 rounded-lg transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Ausgabe hinzufügen"
            title="Ausgabe hinzufügen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <SyncStatusIndicator status={syncStatus} onSync={onSync} onRestore={onRestore} onDismissRestore={onDismissRestore} />

          <button
            onClick={() => onNavigate(page === 'settings' ? 'dashboard' : 'settings')}
            className={`p-2 rounded-lg transition-colors ${
              page === 'settings'
                ? 'bg-amber-500 text-white'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
            aria-label="Einstellungen"
            title="Einstellungen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
