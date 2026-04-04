import React, { useState } from 'react';
import type { Settings } from '../types';
import { SettingsShell } from '../../../components/SettingsShell';

interface SettingsPageProps {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  onClearData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSave, onClose, onClearData }) => {
  const [incomeStr, setIncomeStr] = useState(
    settings.netIncome > 0 ? String(settings.netIncome).replace('.', ',') : '',
  );

  const handleIncomeBlur = () => {
    const val = parseFloat(incomeStr.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      onSave({ ...settings, netIncome: val });
    } else {
      setIncomeStr(settings.netIncome > 0 ? String(settings.netIncome).replace('.', ',') : '');
    }
  };

  return (
    <SettingsShell
      appId="budget"
      subtitle="BudgetWatch konfigurieren"
      theme={settings.theme}
      onThemeChange={(theme) => onSave({ ...settings, theme })}
      onClose={onClose}
      onClearData={onClearData}
      clearLabel="Alle Ausgaben löschen"
      clearMessage="Alle erfassten Ausgaben werden unwiderruflich gelöscht. Fortfahren?"
      activeColorClass="bg-amber-500 border-amber-400"
    >
      <div className="space-y-2">
        <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Einkommen</p>
        <label className="block">
          <span className="text-gray-600 dark:text-slate-400 text-xs">Monatliches Netto-Einkommen</span>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-slate-400 text-sm pointer-events-none">€</span>
            <input
              type="text"
              inputMode="decimal"
              value={incomeStr}
              onChange={(e) => setIncomeStr(e.target.value)}
              onBlur={handleIncomeBlur}
              placeholder="z. B. 2500,00"
              className="w-full pl-7 pr-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </label>
      </div>
    </SettingsShell>
  );
};
