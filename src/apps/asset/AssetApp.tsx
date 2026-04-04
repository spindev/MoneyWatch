import { useState, useCallback } from 'react';
import { AppHeader } from '../../components/AppHeader';
import { OverviewCards } from './components/OverviewCards';
import { AssetList } from './components/AssetList';
import { AssetModal } from './components/AssetModal';
import { SettingsPage } from './components/SettingsPage';
import { loadSettings, saveSettings } from './services/settingsService';
import { loadAssets, saveAssets } from './services/assetsService';
import { Footer } from '../../components/Footer';
import { useTheme } from '../../hooks/useTheme';
import type { Asset, Settings } from './types';
import type { AppId } from '../../components/AppSwitcher';

type Page = 'dashboard' | 'settings';

interface AssetAppProps {
  activeApp: AppId;
  onSwitchApp: (app: AppId) => void;
}

export function AssetApp({ activeApp, onSwitchApp }: AssetAppProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [assets, setAssets] = useState<Asset[]>(loadAssets);
  const [page, setPage] = useState<Page>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  useTheme(settings.theme);

  const handleSaveSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleAddAsset = useCallback((asset: Asset) => {
    setAssets((prev) => {
      const updated = [...prev, asset];
      saveAssets(updated);
      return updated;
    });
    setShowAddModal(false);
  }, []);

  const handleEditAsset = useCallback((asset: Asset) => {
    setAssets((prev) => {
      const updated = prev.map((a) => (a.id === asset.id ? asset : a));
      saveAssets(updated);
      return updated;
    });
    setEditAsset(null);
  }, []);

  const handleDeleteAsset = useCallback((id: string) => {
    setAssets((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveAssets(updated);
      return updated;
    });
  }, []);

  const handleClearData = useCallback(() => {
    setAssets([]);
    saveAssets([]);
    setPage('dashboard');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <AppHeader
        activeApp={activeApp}
        onSwitchApp={onSwitchApp}
        isSettingsActive={page === 'settings'}
        onSettings={() => setPage(page === 'settings' ? 'dashboard' : 'settings')}
        onAdd={() => { setEditAsset(null); setShowAddModal(true); }}
        addLabel="Anlage hinzufügen"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <OverviewCards assets={assets} />

        {assets.length > 0 ? (
          <AssetList
            assets={assets}
            onEdit={(a) => {
              setEditAsset(a);
              setShowAddModal(false);
            }}
            onDelete={handleDeleteAsset}
          />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-10 text-center">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Keine Anlagen erfasst</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-5 max-w-xs mx-auto">
              Füge deine erste Anlage hinzu, um dein gebundenes Kapital im Überblick zu behalten.
            </p>
            <button
              onClick={() => {
                setEditAsset(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Anlage hinzufügen
            </button>
          </div>
        )}
      </main>

      {page === 'settings' && (
        <SettingsPage
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setPage('dashboard')}
          onClearData={handleClearData}
        />
      )}

      {(showAddModal || editAsset != null) && (
        <AssetModal
          asset={editAsset}
          onSave={editAsset != null ? handleEditAsset : handleAddAsset}
          onClose={() => {
            setShowAddModal(false);
            setEditAsset(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
