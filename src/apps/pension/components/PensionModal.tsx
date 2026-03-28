import React, { useState, useEffect } from 'react';
import type { PensionEntry, PensionType } from '../types';
import { PENSION_TYPE_LABELS } from '../types';

interface PensionModalProps {
  pension?: PensionEntry | null;
  retirementYear: number;
  onSave: (pension: PensionEntry) => void;
  onClose: () => void;
}

const PENSION_TYPES: PensionType[] = [
  'gesetzlich',
  'ruerup',
  'betrieblich',
  'riester',
  'privat',
  'etf',
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const PensionModal: React.FC<PensionModalProps> = ({
  pension,
  retirementYear,
  onSave,
  onClose,
}) => {
  const isEdit = pension != null;

  const [name, setName] = useState(pension?.name ?? '');
  const [type, setType] = useState<PensionType>(pension?.type ?? 'gesetzlich');
  const [monthlyGrossRaw, setMonthlyGrossRaw] = useState(
    pension ? String(pension.monthlyGross) : '',
  );
  const [startYearRaw, setStartYearRaw] = useState(
    String(pension?.startYear ?? retirementYear),
  );
  const [notes, setNotes] = useState(pension?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset when a new pension is passed in (e.g., switching from add to edit)
  useEffect(() => {
    setName(pension?.name ?? '');
    setType(pension?.type ?? 'gesetzlich');
    setMonthlyGrossRaw(pension ? String(pension.monthlyGross) : '');
    setStartYearRaw(String(pension?.startYear ?? retirementYear));
    setNotes(pension?.notes ?? '');
    setErrors({});
  }, [pension, retirementYear]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e['name'] = 'Name darf nicht leer sein.';
    const gross = parseFloat(monthlyGrossRaw.replace(',', '.'));
    if (isNaN(gross) || gross < 0) e['monthlyGross'] = 'Bitte einen gültigen Betrag eingeben.';
    const startYear = parseInt(startYearRaw, 10);
    if (isNaN(startYear) || startYear < 1990 || startYear > 2100) {
      e['startYear'] = 'Bitte ein gültiges Jahr eingeben (1990–2100).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: pension?.id ?? generateId(),
      name: name.trim(),
      type,
      monthlyGross: parseFloat(monthlyGrossRaw.replace(',', '.')),
      startYear: parseInt(startYearRaw, 10),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">
              {isEdit ? 'Rente bearbeiten' : 'Neue Rente hinzufügen'}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
              {isEdit ? 'Daten dieser Rentenquelle aktualisieren' : 'Neue Rentenquelle erfassen'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-4 flex-shrink-0"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pension Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Rentenart
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PensionType)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PENSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PENSION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Bezeichnung
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Deutsche Rentenversicherung"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors['name'] && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors['name']}</p>
            )}
          </div>

          {/* Monthly gross */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Monatliche Brutto-Rente (€)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={monthlyGrossRaw}
              onChange={(e) => setMonthlyGrossRaw(e.target.value)}
              placeholder="z. B. 1500.00"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors['monthlyGross'] && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors['monthlyGross']}</p>
            )}
          </div>

          {/* Start year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Rentenbeginn-Jahr
              <span className="ml-1 text-gray-400 dark:text-slate-500 font-normal text-xs">
                (beeinflusst den Besteuerungsanteil)
              </span>
            </label>
            <input
              type="number"
              min="1990"
              max="2100"
              step="1"
              value={startYearRaw}
              onChange={(e) => setStartYearRaw(e.target.value)}
              placeholder={String(retirementYear)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors['startYear'] && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors['startYear']}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Notizen (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z. B. Rentennummer, Anbieter-Infos …"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {isEdit ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
