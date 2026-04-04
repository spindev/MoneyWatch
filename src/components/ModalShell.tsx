import React from 'react';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidth?: string;
  scrollable?: boolean;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({ title, subtitle, onClose, maxWidth = 'max-w-md', scrollable, children }) => (
  <div
    className={`fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 ${scrollable ? 'overflow-y-auto' : 'items-center'}`}
    onClick={onClose}
  >
    <div
      className={`w-full ${maxWidth} bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl my-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-gray-900 dark:text-white font-semibold text-lg">{title}</h2>
          {subtitle && <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-4 flex-shrink-0"
          aria-label="Schließen"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);
