import { useState } from 'react';
import { PortfolioApp } from './apps/portfolio/PortfolioApp';
import { PensionApp } from './apps/pension/PensionApp';
import { BudgetApp } from './apps/budget/BudgetApp';
import { AssetApp } from './apps/asset/AssetApp';
import type { AppId } from './components/AppSwitcher';

const ACTIVE_APP_KEY = 'moneywatch_active_app';

function loadActiveApp(): AppId {
  const raw = localStorage.getItem(ACTIVE_APP_KEY);
  if (raw === 'portfolio' || raw === 'pension' || raw === 'budget' || raw === 'asset') return raw;
  return 'portfolio';
}

function App() {
  const [activeApp, setActiveApp] = useState<AppId>(loadActiveApp);

  const handleSwitchApp = (app: AppId) => {
    setActiveApp(app);
    localStorage.setItem(ACTIVE_APP_KEY, app);
  };

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
