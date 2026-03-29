import React, { useState } from 'react';
import type { Asset, AssetCategory } from '../types';
import { ASSET_CATEGORY_LABELS } from '../types';

interface AssetModalProps {
  asset: Asset | null;
  onSave: (asset: Asset) => void;
  onClose: () => void;
}

function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!;
}

export const AssetModal: React.FC<AssetModalProps> = ({ asset, onSave, onClose }) => {
  const [name, setName] = useState(asset?.name ?? '');
  const [category, setCategory] = useState<AssetCategory>(asset?.category ?? 'tagesgeld');
  const [valueStr, setValueStr] = useState(
    asset ? String(asset.value).replace('.', ',') : '',
  );
  const [rateStr, setRateStr] = useState(
    asset?.interestRate != null ? String(asset.interestRate).replace('.', ',') : '',
  );
  const [notes, setNotes] = useState(asset?.notes ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Bitte eine Bezeichnung eingeben.');
      return;
    }
    const value = parseFloat(valueStr.replace(',', '.'));
    if (isNaN(value) || value < 0) {
      setError('Bitte einen gültigen Betrag eingeben.');
      return;
    }
    const rateRaw = rateStr.trim();
    let interestRate: number | undefined;
    if (rateRaw !== '') {
      const parsed = parseFloat(rateRaw.replace(',', '.'));
      if (isNaN(parsed) || parsed < 0) {
        setError('Bitte einen gültigen Zinssatz eingeben.');
        return;
      }
      interestRate = parsed;
    }
    onSave({
      id: asset?.id ?? newId(),
      name: trimmed,
      category,
      value,
      interestRate,
      date: todayIso(),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">
              {asset ? 'Anlage bearbeiten' : 'Neue Anlage'}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
              {asset ? 'Anlage aktualisieren' : 'Anlage erfassen'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Name */}
          <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
              Bezeichnung
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="z. B. ING Tagesgeld, Wohnung Berlin"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
              Kategorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ fontSize: '16px' }}
            >
              {(Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {ASSET_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Value + Interest rate */}
          <div className="flex flex-row gap-3">
            <div className="flex-1">
              <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                Aktueller Wert
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-slate-400 text-sm pointer-events-none">€</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={valueStr}
                  onChange={(e) => { setValueStr(e.target.value); setError(''); }}
                  placeholder="0,00"
                  className="w-full pl-7 pr-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                Zinssatz{' '}
                <span className="text-gray-400 dark:text-slate-500 font-normal">(opt.)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStr}
                  onChange={(e) => { setRateStr(e.target.value); setError(''); }}
                  placeholder="0,00"
                  className="w-full pl-3 pr-8 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ fontSize: '16px' }}
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-slate-400 text-sm pointer-events-none">%</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
              Notiz <span className="text-gray-400 dark:text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionale Anmerkung"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              {asset ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
