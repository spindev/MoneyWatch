/** All localStorage keys used by MoneyWatch apps */
const BACKUP_KEYS = [
  'moneywatch_active_app',
  'portfoliowatch_settings',
  'portfoliowatch_imported_lots',
  'portfoliowatch_imported_sales',
  'pensionwatch_settings',
  'pensionwatch_pensions',
  'budgetwatch_settings',
  'budgetwatch_expenses',
] as const;

export interface BackupData {
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

/** Serialise all MoneyWatch localStorage entries to a JSON string and trigger a browser download. */
export function exportBackup(): void {
  const data: Record<string, string> = {};
  for (const key of BACKUP_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  }

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moneywatch-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export type ImportResult =
  | { ok: true; restoredKeys: string[] }
  | { ok: false; error: string };

/** Parse a backup JSON string and restore it to localStorage. */
export function importBackup(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Ungültiges Dateiformat – kein gültiges JSON.' };
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as BackupData).version !== 1 ||
    typeof (parsed as BackupData).data !== 'object'
  ) {
    return { ok: false, error: 'Ungültiges Backup-Format (Version nicht erkannt).' };
  }

  const backup = parsed as BackupData;
  const restoredKeys: string[] = [];

  for (const key of BACKUP_KEYS) {
    if (key in backup.data) {
      try {
        JSON.parse(backup.data[key]); // validate nested JSON before writing
        localStorage.setItem(key, backup.data[key]);
        restoredKeys.push(key);
      } catch {
        // skip malformed individual keys
      }
    }
  }

  if (restoredKeys.length === 0) {
    return { ok: false, error: 'Die Backup-Datei enthält keine bekannten Daten.' };
  }

  return { ok: true, restoredKeys };
}
