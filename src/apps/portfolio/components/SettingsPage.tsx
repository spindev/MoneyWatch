import React, { useState } from 'react';
import type { Settings } from '../types';
import { SettingsShell } from '../../../components/SettingsShell';

interface SettingsPageProps {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  onClearPortfolio: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSave, onClose, onClearPortfolio }) => {
  const [monthlySavingsRaw, setMonthlySavingsRaw] = useState(String(settings.monthlySavings));
  const [forecastYearsRaw, setForecastYearsRaw] = useState(String(settings.forecastYears));

  const handleMonthlySavingsBlur = () => {
    const val = parseFloat(monthlySavingsRaw.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      onSave({ ...settings, monthlySavings: val });
    } else {
      setMonthlySavingsRaw(String(settings.monthlySavings));
    }
  };

  const handleForecastYearsBlur = () => {
    const val = parseInt(forecastYearsRaw, 10);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      onSave({ ...settings, forecastYears: val });
    } else {
      setForecastYearsRaw(String(settings.forecastYears));
    }
  };

  return (
    <SettingsShell
      appId="portfolio"
      subtitle="PortfolioWatch konfigurieren"
      theme={settings.theme}
      onThemeChange={(theme) => onSave({ ...settings, theme })}
      onClose={onClose}
      onClearData={onClearPortfolio}
      clearLabel="Portfolio löschen"
      clearMessage="Alle importierten Käufe und Verkäufe werden unwiderruflich gelöscht. Fortfahren?"
      activeColorClass="bg-blue-600 border-blue-500"
    >
      <div className="space-y-3">
        <p className="text-gray-700 dark:text-slate-300 text-sm font-medium">Prognose</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-gray-600 dark:text-slate-400 text-xs">Sparrate (€/Monat)</span>
            <input
              type="number"
              min="0"
              step="any"
              value={monthlySavingsRaw}
              onChange={(e) => setMonthlySavingsRaw(e.target.value)}
              onBlur={handleMonthlySavingsBlur}
              className="mt-1 w-full px-3 py-2 rounded-lg text-base border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-gray-600 dark:text-slate-400 text-xs">Anzahl Jahre</span>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={forecastYearsRaw}
              onChange={(e) => setForecastYearsRaw(e.target.value)}
              onBlur={handleForecastYearsBlur}
              className="mt-1 w-full px-3 py-2 rounded-lg text-base border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </SettingsShell>
  );
};
