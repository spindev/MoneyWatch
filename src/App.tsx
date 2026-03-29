import { useState, useEffect } from 'react';
import { PortfolioApp } from './apps/portfolio/PortfolioApp';
import { PensionApp } from './apps/pension/PensionApp';
import { BudgetApp } from './apps/budget/BudgetApp';
import { AssetApp } from './apps/asset/AssetApp';
import type { AppId } from './components/AppSwitcher';

const ACTIVE_APP_KEY = 'moneywatch_active_app';

function loadActiveApp(): AppId {
  try {
    const raw = localStorage.getItem(ACTIVE_APP_KEY);
    if (raw === 'portfolio' || raw === 'pension' || raw === 'budget' || raw === 'asset') return raw;
  } catch {
    // ignore
  }
  return 'portfolio';
}

function saveActiveApp(app: AppId): void {
  try {
    localStorage.setItem(ACTIVE_APP_KEY, app);
  } catch {
    // ignore
  }
}

function App() {
  const [activeApp, setActiveApp] = useState<AppId>(loadActiveApp);

  const handleSwitchApp = (app: AppId) => {
    setActiveApp(app);
    saveActiveApp(app);
  };

  // Sync theme class on document root whenever the active app changes.
  // Each sub-app manages its own theme preference independently; the root
  // class is set by the sub-app via its own useEffect. This effect ensures
  // that when switching apps the page doesn't flash an incorrect theme.
  useEffect(() => {
    // No-op — each sub-app sets its own theme via document.documentElement
  }, [activeApp]);

  return (
    <>
      {activeApp === 'portfolio' ? (
        <PortfolioApp activeApp={activeApp} onSwitchApp={handleSwitchApp} />
      ) : activeApp === 'pension' ? (
        <PensionApp activeApp={activeApp} onSwitchApp={handleSwitchApp} />
      ) : activeApp === 'asset' ? (
        <AssetApp activeApp={activeApp} onSwitchApp={handleSwitchApp} />
      ) : (
        <BudgetApp activeApp={activeApp} onSwitchApp={handleSwitchApp} />
      )}
    </>
  );
}

export default App;
