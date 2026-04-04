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
  const [kvZusatz, setKvZusatz] = useState(String(settings.tax.kvZusatzbeitrag));

  const handleKvZusatzBlur = () => {
    const val = parseFloat(kvZusatz.replace(',', '.'));
    if (!isNaN(val) && val >= 0 && val <= 10) {
      onSave({ ...settings, tax: { ...settings.tax, kvZusatzbeitrag: val } });
    } else {
      setKvZusatz(String(settings.tax.kvZusatzbeitrag));
    }
  };

  return (
    <SettingsShell
      appId="pension"
      subtitle="PensionWatch konfigurieren"
      theme={settings.theme}
      onThemeChange={(theme) => onSave({ ...settings, theme })}
      onClose={onClose}
      onClearData={onClearData}
      clearLabel="Alle Renten löschen"
      clearMessage="Alle eingetragenen Renten werden unwiderruflich gelöscht. Fortfahren?"
      activeColorClass="bg-violet-600 border-violet-500"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-gray-600 dark:text-slate-400 text-xs font-medium">Renteneintritt</span>
          <input
            type="month"
            value={settings.retirementDate ? settings.retirementDate.substring(0, 7) : ''}
            onChange={(e) => onSave({ ...settings, retirementDate: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg text-base border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 [color-scheme:light] dark:[color-scheme:dark]"
          />
        </label>
        <label className="block">
          <span className="text-gray-600 dark:text-slate-400 text-xs font-medium">KV-Zusatzbeitrag (%)</span>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={kvZusatz}
            onChange={(e) => setKvZusatz(e.target.value)}
            onBlur={handleKvZusatzBlur}
            className="mt-1 w-full px-3 py-2 rounded-lg text-base border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </label>
      </div>
    </SettingsShell>
  );
};
