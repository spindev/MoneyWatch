import React from 'react';
import type { Settings } from '../types';
import { SettingsShell } from '../../../components/SettingsShell';

interface SettingsPageProps {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  onClearData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSave, onClose, onClearData }) => (
  <SettingsShell
    appId="asset"
    subtitle="AssetWatch konfigurieren"
    theme={settings.theme}
    onThemeChange={(theme) => onSave({ ...settings, theme })}
    onClose={onClose}
    onClearData={onClearData}
    clearLabel="Alle Anlagen löschen"
    clearMessage="Alle erfassten Anlagen werden unwiderruflich gelöscht. Fortfahren?"
    activeColorClass="bg-emerald-600 border-emerald-500"
  />
);
