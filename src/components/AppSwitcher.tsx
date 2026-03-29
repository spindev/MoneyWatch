import React from 'react';
import { APP_DEFINITIONS } from './appDefinitions';
import type { AppId } from './appDefinitions';

export type { AppId };
export { APP_DEFINITIONS };

interface AppSwitcherProps {
  activeApp: AppId;
  onSelect: (app: AppId) => void;
  onClose: () => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = ({ activeApp, onSelect, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dropdown panel */}
      <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xl z-30 overflow-hidden">
        <div className="px-3 pt-3 pb-1">
          <p className="text-gray-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
            Anwendung wechseln
          </p>
        </div>
        <div className="p-2 space-y-0.5">
          {APP_DEFINITIONS.map((app) => {
            const isActive = app.id === activeApp;
            return (
              <button
                key={app.id}
                onClick={() => { onSelect(app.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  isActive
                    ? app.colorActiveBg
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className={`w-8 h-8 ${app.colorBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {app.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-tight ${isActive ? app.colorActiveText : 'text-gray-900 dark:text-white'}`}>
                    {app.name}
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs">{app.subtitle}</p>
                </div>
                {isActive && (
                  <svg className={`w-4 h-4 ${app.colorCheck} ml-auto flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-slate-700/50">
          <p className="text-gray-400 dark:text-slate-600 text-xs text-center">MoneyWatch</p>
        </div>
      </div>
    </>
  );
};
