import React, { useState } from 'react';
import type { Expense, ExpenseFrequency } from '../types';
import { FREQUENCY_LABELS } from '../types';
import { ModalShell } from '../../../components/ModalShell';
import { generateId } from '../../../lib/storage';

interface ExpenseModalProps {
  expense: Expense | null;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}

const GERMAN_MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function getDaysInMonth(month: string): number {
  return new Date(2001, parseInt(month, 10), 0).getDate();
}

function parseDayMonth(iso?: string): { day: string; month: string } {
  if (!iso) return { day: '01', month: '01' };
  const parts = iso.split('-');
  return { day: parts[2] ?? '01', month: parts[1] ?? '01' };
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onSave, onClose }) => {
  const [name, setName] = useState(expense?.name ?? '');
  const [amountStr, setAmountStr] = useState(expense ? String(expense.amount).replace('.', ',') : '');
  const [frequency, setFrequency] = useState<ExpenseFrequency>(expense?.frequency ?? 'monthly');
  const parsed = parseDayMonth(expense?.date);
  const [day, setDay] = useState(parsed.day);
  const [month, setMonth] = useState(parsed.month);
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [error, setError] = useState('');

  const maxDays = getDaysInMonth(month);

  const handleMonthChange = (newMonth: string) => {
    const newMax = getDaysInMonth(newMonth);
    if (parseInt(day, 10) > newMax) setDay(String(newMax).padStart(2, '0'));
    setMonth(newMonth);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Bitte einen Namen eingeben.'); return; }
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) { setError('Bitte einen gültigen Betrag eingeben.'); return; }
    onSave({ id: expense?.id ?? generateId(), name: trimmed, amount, frequency, date: `2000-${month}-${day}`, notes: notes.trim() || undefined });
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500';
  const label = (text: string) => <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">{text}</label>;

  return (
    <ModalShell
      title={expense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}
      subtitle={expense ? 'Ausgabe aktualisieren' : 'Ausgabe erfassen'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {error && <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

        <div>
          {label('Bezeichnung')}
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="z. B. Miete, Netflix, KFZ-Versicherung" className={inputCls} style={{ fontSize: '16px' }} />
        </div>

        <div className="flex flex-row gap-3">
          <div className="flex-1">
            {label('Betrag')}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-slate-400 text-sm pointer-events-none">€</span>
              <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => { setAmountStr(e.target.value); setError(''); }} placeholder="0,00" className={`${inputCls} pl-7`} style={{ fontSize: '16px' }} />
            </div>
          </div>
          <div className="flex-1">
            {label('Datum')}
            <div className="flex gap-1.5">
              <select value={day} onChange={(e) => setDay(e.target.value)} className={inputCls} aria-label="Tag" style={{ fontSize: '16px' }}>
                {Array.from({ length: maxDays }, (_, i) => {
                  const d = String(i + 1).padStart(2, '0');
                  return <option key={d} value={d}>{i + 1}</option>;
                })}
              </select>
              <select value={month} onChange={(e) => handleMonthChange(e.target.value)} className={inputCls} aria-label="Monat" style={{ fontSize: '16px' }}>
                {GERMAN_MONTHS.map((mName, i) => {
                  const m = String(i + 1).padStart(2, '0');
                  return <option key={m} value={m}>{mName}</option>;
                })}
              </select>
            </div>
          </div>
        </div>

        <div>
          {label('Turnus')}
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as ExpenseFrequency)} className={inputCls} style={{ fontSize: '16px' }}>
            {(Object.keys(FREQUENCY_LABELS) as ExpenseFrequency[]).map((f) => (
              <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
            ))}
          </select>
        </div>

        <div>
          {label('Notiz')}
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optionale Anmerkung" className={inputCls} style={{ fontSize: '16px' }} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            Abbrechen
          </button>
          <button type="submit" className="flex-1 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors">
            {expense ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
