import React from 'react';
import { AppHeader } from '../../../components/AppHeader';
import type { AppId } from '../../../components/AppHeader';

interface HeaderProps {
  page: 'dashboard' | 'settings';
  onNavigate: (page: 'dashboard' | 'settings') => void;
  onAddExpense: () => void;
  activeApp: AppId;
  onSwitchApp: (app: AppId) => void;
}

export const Header: React.FC<HeaderProps> = ({ page, onNavigate, onAddExpense, activeApp, onSwitchApp }) => (
  <AppHeader
    activeApp={activeApp}
    onSwitchApp={onSwitchApp}
    isSettingsActive={page === 'settings'}
    onSettings={() => onNavigate(page === 'settings' ? 'dashboard' : 'settings')}
    actions={
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
    }
  />
);
