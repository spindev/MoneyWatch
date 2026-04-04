import React, { useState } from 'react';
import type { Asset } from '../types';
import { ASSET_CATEGORY_LABELS, ASSET_CATEGORY_BG, ASSET_CATEGORY_TEXT } from '../types';
import { fmt, fmtDate } from '../../../lib/format';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onEdit, onDelete }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (assets.length === 0) {
    return null;
  }

  const sorted = [...assets].sort((a, b) => b.value - a.value);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-gray-900 dark:text-white font-semibold text-base">
            Anlagen ({assets.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {sorted.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onEdit(asset)}
              className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group cursor-pointer"
            >
              {/* Category indicator */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ASSET_CATEGORY_BG[asset.category]}`}>
                <span
                  className={`text-xs font-bold ${ASSET_CATEGORY_TEXT[asset.category]}`}
                >
                  {ASSET_CATEGORY_LABELS[asset.category].slice(0, 1)}
                </span>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{asset.name}</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs">
                  {ASSET_CATEGORY_LABELS[asset.category]}
                  {asset.interestRate != null && asset.interestRate > 0 && (
                    <span className="ml-1">
                      · {asset.interestRate.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} % p.a.
                    </span>
                  )}
                  {asset.date && (
                    <span className="ml-1">· Stand {fmtDate(asset.date)}</span>
                  )}
                  {asset.notes && (
                    <span className="ml-1 italic">· {asset.notes}</span>
                  )}
                </p>
              </div>

              {/* Value */}
              <div className="text-right flex-shrink-0">
                <p className="text-gray-900 dark:text-white text-sm font-semibold tabular-nums">
                  {fmt(asset.value)} €
                </p>
              </div>

              {/* Delete action */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => handleDeleteClick(e, asset.id)}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Löschen"
                  title="Löschen"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold">Anlage löschen?</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
                  {assets.find((a) => a.id === confirmDeleteId)?.name ?? 'Diese Anlage'} wird unwiderruflich gelöscht.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
