import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { OverviewChart } from './components/OverviewChart';
import { PensionTable } from './components/PensionTable';
import { PensionModal } from './components/PensionModal';
import { PensionGapCard } from './components/PensionGapCard';
import { SettingsPage } from './components/SettingsPage';
import { EmptyState } from './components/EmptyState';
import { loadSettings, saveSettings } from './services/settingsService';
import { loadPensions, savePensions } from './services/pensionsService';
import { calcTaxBreakdown } from './utils/calculations';
import type { PensionEntry, Settings } from './types';
import type { AppId } from '../../components/AppSwitcher';

type Page = 'dashboard' | 'settings';

interface PensionAppProps {
  activeApp: AppId;
  onSwitchApp: (app: AppId) => void;
}

export function PensionApp({ activeApp, onSwitchApp }: PensionAppProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [pensions, setPensions] = useState<PensionEntry[]>(loadPensions);
  const [page, setPage] = useState<Page>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPension, setEditPension] = useState<PensionEntry | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleSaveSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleAddPension = useCallback((pension: PensionEntry) => {
    setPensions((prev) => {
      const updated = [...prev, pension];
      savePensions(updated);
      return updated;
    });
    setShowAddModal(false);
  }, []);

  const handleEditPension = useCallback((pension: PensionEntry) => {
    setPensions((prev) => {
      const updated = prev.map((p) => (p.id === pension.id ? pension : p));
      savePensions(updated);
      return updated;
    });
    setEditPension(null);
  }, []);

  const handleDeletePension = useCallback((id: string) => {
    setPensions((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePensions(updated);
      return updated;
    });
  }, []);

  const handleClearData = useCallback(() => {
    setPensions([]);
    savePensions([]);
    setPage('dashboard');
  }, []);

  const currentYear = new Date().getFullYear();

  const breakdown = calcTaxBreakdown(pensions, settings.tax);

  const retirementYear = (() => {
    if (!settings.retirementDate) return currentYear;
    const y = parseInt(settings.retirementDate.substring(0, 4), 10);
    return isNaN(y) ? currentYear : y;
  })();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <Header
        page={page}
        onNavigate={setPage}
        onAddPension={() => {
          setEditPension(null);
          setShowAddModal(true);
        }}
        activeApp={activeApp}
        onSwitchApp={onSwitchApp}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {pensions.length === 0 ? (
          /* ─── Empty / Welcome State ──────────────────────────────── */
          <EmptyState
            onAddPension={() => {
              setEditPension(null);
              setShowAddModal(true);
            }}
          />
        ) : (
          <>
            {/* ─── Monthly Overview ───────────────────────────────── */}
            <OverviewChart
              breakdown={breakdown}
              taxSettings={settings.tax}
            />

            {/* ─── Pension Gap ────────────────────────────────────── */}
            <PensionGapCard netPensionMonthly={breakdown.netMonthly} />

            {/* ─── Pension Table ───────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-900 dark:text-white font-semibold">
                  Rentenquellen ({pensions.length})
                </h2>
                <button
                  onClick={() => {
                    setEditPension(null);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Rente hinzufügen
                </button>
              </div>
              <PensionTable
                pensions={pensions}
                onEdit={(p) => {
                  setEditPension(p);
                  setShowAddModal(false);
                }}
                onDelete={handleDeletePension}
              />
            </div>
          </>
        )}
      </main>

      {/* ─── Modals / Overlays ────────────────────────────────────────────── */}
      {page === 'settings' && (
        <SettingsPage
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setPage('dashboard')}
          onClearData={handleClearData}
        />
      )}

      {(showAddModal || editPension != null) && (
        <PensionModal
          pension={editPension}
          retirementYear={retirementYear}
          onSave={editPension != null ? handleEditPension : handleAddPension}
          onClose={() => {
            setShowAddModal(false);
            setEditPension(null);
          }}
        />
      )}
    </div>
  );
}
