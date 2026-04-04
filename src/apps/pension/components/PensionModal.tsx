import React, { useState, useEffect } from 'react';
import type { PensionEntry, PensionType } from '../types';
import { PENSION_TYPE_LABELS } from '../types';
import { ModalShell } from '../../../components/ModalShell';
import { generateId } from '../../../lib/storage';

interface PensionModalProps {
  pension?: PensionEntry | null;
  retirementYear: number;
  onSave: (pension: PensionEntry) => void;
  onClose: () => void;
}

const PENSION_TYPES: PensionType[] = ['gesetzlich', 'ruerup', 'betrieblich', 'riester', 'privat', 'etf'];

export const PensionModal: React.FC<PensionModalProps> = ({ pension, retirementYear, onSave, onClose }) => {
  const isEdit = pension != null;
  const [name, setName] = useState(pension?.name ?? '');
  const [type, setType] = useState<PensionType>(pension?.type ?? 'gesetzlich');
  const [monthlyGrossRaw, setMonthlyGrossRaw] = useState(pension ? String(pension.monthlyGross) : '');
  const [notes, setNotes] = useState(pension?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(pension?.name ?? '');
    setType(pension?.type ?? 'gesetzlich');
    setMonthlyGrossRaw(pension ? String(pension.monthlyGross) : '');
    setNotes(pension?.notes ?? '');
    setErrors({});
  }, [pension]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs['name'] = 'Name darf nicht leer sein.';
    const gross = parseFloat(monthlyGrossRaw.replace(',', '.'));
    if (isNaN(gross) || gross < 0) errs['monthlyGross'] = 'Bitte einen gültigen Betrag eingeben.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ id: pension?.id ?? generateId(), name: name.trim(), type, monthlyGross: gross, startYear: retirementYear, notes: notes.trim() || undefined });
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500';

  return (
    <ModalShell
      title={isEdit ? 'Rente bearbeiten' : 'Neue Rente hinzufügen'}
      subtitle={isEdit ? 'Daten dieser Rentenquelle aktualisieren' : 'Neue Rentenquelle erfassen'}
      onClose={onClose}
      scrollable
    >
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rentenart</label>
          <select value={type} onChange={(e) => setType(e.target.value as PensionType)} className={inputCls}>
            {PENSION_TYPES.map((t) => <option key={t} value={t}>{PENSION_TYPE_LABELS[t]}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bezeichnung</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Deutsche Rentenversicherung" className={inputCls} />
          {errors['name'] && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors['name']}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Monatliche Brutto-Rente (€)</label>
          <input type="number" min="0" step="any" value={monthlyGrossRaw} onChange={(e) => setMonthlyGrossRaw(e.target.value)} placeholder="z. B. 1500.00" className={inputCls} />
          {errors['monthlyGross'] && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors['monthlyGross']}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Notizen (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="z. B. Rentennummer, Anbieter-Infos …" rows={2} className={`${inputCls} resize-none`} />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            Abbrechen
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors">
            {isEdit ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
