import React from 'react';

export const Footer: React.FC = () => (
  <footer className="text-center text-gray-400 dark:text-slate-500 text-xs py-4 mt-4 border-t border-gray-100 dark:border-slate-800">
    <span>v{__APP_VERSION__}</span>
    <span className="mx-2">·</span>
    <span>Made by SpinDev &amp; Copilot with ❤️</span>
  </footer>
);
