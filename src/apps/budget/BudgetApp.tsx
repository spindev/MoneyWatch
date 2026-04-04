import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { OverviewTable } from './components/OverviewTable';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseModal } from './components/ExpenseModal';
import { SettingsPage } from './components/SettingsPage';
import { loadSettings, saveSettings } from './services/settingsService';
import { loadExpenses, saveExpenses } from './services/expensesService';
import { Footer } from '../../components/Footer';
import { useTheme } from '../../hooks/useTheme';
import type { Expense, Settings } from './types';
import type { AppId } from '../../components/AppSwitcher';

type Page = 'dashboard' | 'settings';

interface BudgetAppProps {
  activeApp: AppId;
  onSwitchApp: (app: AppId) => void;
}

export function BudgetApp({ activeApp, onSwitchApp }: BudgetAppProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [page, setPage] = useState<Page>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  useTheme(settings.theme);

  const handleSaveSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleAddExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => {
      const updated = [...prev, expense];
      saveExpenses(updated);
      return updated;
    });
    setShowAddModal(false);
  }, []);

  const handleEditExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === expense.id ? expense : e));
      saveExpenses(updated);
      return updated;
    });
    setEditExpense(null);
  }, []);

  const handleDeleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveExpenses(updated);
      return updated;
    });
  }, []);

  const handleClearData = useCallback(() => {
    setExpenses([]);
    saveExpenses([]);
    setPage('dashboard');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <Header
        page={page}
        onNavigate={setPage}
        onAddExpense={() => {
          setEditExpense(null);
          setShowAddModal(true);
        }}
        activeApp={activeApp}
        onSwitchApp={onSwitchApp}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── Overview Table ────────────────────────────────────────── */}
        <OverviewTable netIncome={settings.netIncome} expenses={expenses} />

        {/* ─── Expense List ──────────────────────────────────────────── */}
        {expenses.length > 0 ? (
          <ExpenseList
            expenses={expenses}
            netIncome={settings.netIncome}
            onEdit={(e) => {
              setEditExpense(e);
              setShowAddModal(false);
            }}
            onDelete={handleDeleteExpense}
          />
        ) : (
          /* ─── Empty state ─────────────────────────────────────── */
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-10 text-center">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Keine Ausgaben erfasst</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-5 max-w-xs mx-auto">
              Füge deine erste Ausgabe hinzu, um dein Budget im Blick zu behalten.
            </p>
            <button
              onClick={() => {
                setEditExpense(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ausgabe hinzufügen
            </button>
          </div>
        )}
      </main>

      {/* ─── Settings overlay ───────────────────────────────────────────── */}
      {page === 'settings' && (
        <SettingsPage
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setPage('dashboard')}
          onClearData={handleClearData}
        />
      )}

      {/* ─── Add / Edit modal ───────────────────────────────────────────── */}
      {(showAddModal || editExpense != null) && (
        <ExpenseModal
          expense={editExpense}
          onSave={editExpense != null ? handleEditExpense : handleAddExpense}
          onClose={() => {
            setShowAddModal(false);
            setEditExpense(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
