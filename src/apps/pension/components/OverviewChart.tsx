import React, { useState, useRef, useEffect } from 'react';
import type { TaxBreakdown, TaxSettings } from '../types';
import { SPARERPAUSCHBETRAG } from '../utils/calculations';
import { fmt as fmtNum } from '../../../lib/format';

interface OverviewChartProps {
  breakdown: TaxBreakdown;
  taxSettings: TaxSettings;
}

const fmt = (v: number) => fmtNum(v) + ' €';
const fmtPct = (v: number) => fmtNum(v) + ' %';

export const OverviewChart: React.FC<OverviewChartProps> = ({
  breakdown,
  taxSettings,
}) => {
  const [showBruttoDetails, setShowBruttoDetails] = useState(false);
  const bruttoDetailsRef = useRef<HTMLDivElement>(null);
  const [showIncomeTaxDetails, setShowIncomeTaxDetails] = useState(false);
  const incomeTaxDetailsRef = useRef<HTMLDivElement>(null);
  const [showKvDetails, setShowKvDetails] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [showTaxDetails, setShowTaxDetails] = useState(false);
  const taxDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showBruttoDetails) return;
    const handleClick = (e: MouseEvent) => {
      if (bruttoDetailsRef.current && !bruttoDetailsRef.current.contains(e.target as Node)) {
        setShowBruttoDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showBruttoDetails]);

  useEffect(() => {
    if (!showIncomeTaxDetails) return;
    const handleClick = (e: MouseEvent) => {
      if (incomeTaxDetailsRef.current && !incomeTaxDetailsRef.current.contains(e.target as Node)) {
        setShowIncomeTaxDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showIncomeTaxDetails]);

  useEffect(() => {
    if (!showKvDetails) return;
    const handleClick = (e: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(e.target as Node)) {
        setShowKvDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showKvDetails]);

  useEffect(() => {
    if (!showTaxDetails) return;
    const handleClick = (e: MouseEvent) => {
      if (taxDetailsRef.current && !taxDetailsRef.current.contains(e.target as Node)) {
        setShowTaxDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTaxDetails]);

  if (breakdown.totalGrossMonthly === 0) return null;

  const pvRate = taxSettings.hasChildren ? 3.6 : 4.2;
  const kapitalabgabenMonthly = breakdown.kapitalertragsteuerMonthly + breakdown.soliMonthly;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
      <h3 className="text-gray-700 dark:text-slate-300 text-sm font-medium mb-3">
        Monatliche Übersicht
      </h3>
      <div className="space-y-2">
        <SummaryRow
          label="Brutto gesamt"
          value={breakdown.totalGrossMonthly}
          color="bg-violet-500"
          max={breakdown.totalGrossMonthly}
          infoButton={
            <div ref={bruttoDetailsRef}>
              <button
                onClick={() => setShowBruttoDetails((v) => !v)}
                className="ml-1 w-4 h-4 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-none"
                aria-label="Details zu Brutto gesamt"
              >
                ?
              </button>
              {showBruttoDetails && (
                <div className="absolute left-0 top-full mt-1 z-50 w-64 max-w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl p-3 space-y-2 text-xs">
                  <p className="font-semibold text-gray-800 dark:text-white">Details Brutto gesamt</p>
                  <div className="space-y-1.5 text-gray-500 dark:text-slate-400">
                    <p>Summe aller monatlichen Brutto-Renten vor Steuern und Sozialabgaben.</p>
                    <div className="border-t border-gray-100 dark:border-slate-600 pt-1.5 flex justify-between font-semibold text-gray-800 dark:text-white">
                      <span>Gesamt / Monat</span>
                      <span className="tabular-nums">{fmt(breakdown.totalGrossMonthly)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 dark:text-slate-500">
                      <span>Gesamt / Jahr</span>
                      <span className="tabular-nums">{fmt(breakdown.totalGrossAnnual)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />
        <SummaryRow
          label="Einkommensteuer"
          value={breakdown.incomeTaxMonthly}
          color="bg-red-500"
          max={breakdown.totalGrossMonthly}
          infoButton={
            <div ref={incomeTaxDetailsRef}>
              <button
                onClick={() => setShowIncomeTaxDetails((v) => !v)}
                className="ml-1 w-4 h-4 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-none"
                aria-label="Details zu Einkommensteuer"
              >
                ?
              </button>
              {showIncomeTaxDetails && (
                <div className="absolute left-0 top-full mt-1 z-50 w-72 max-w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl p-3 space-y-2 text-xs">
                  <p className="font-semibold text-gray-800 dark:text-white">Details Einkommensteuer</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Zu versteuerndes Einkommen (jährl.)</span>
                      <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.taxableAnnual)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Einkommensteuer (§ 32a EStG, jährl.)</span>
                      <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.incomeTaxAnnual)}</span>
                    </div>
                    {taxSettings.kirchensteuer && breakdown.kirchensteuerAnnual > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Kirchensteuer ({taxSettings.kirchensteuerRate} %)</span>
                        <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.kirchensteuerAnnual)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 dark:border-slate-600 pt-1.5 flex justify-between font-semibold text-gray-800 dark:text-white">
                      <span>Gesamt / Monat</span>
                      <span className="tabular-nums">{fmt(breakdown.incomeTaxMonthly + breakdown.kirchensteuerMonthly)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />
        <SummaryRow
          label="Sozialabgaben"
          value={breakdown.totalSocialMonthly}
          color="bg-orange-400"
          max={breakdown.totalGrossMonthly}
          infoButton={
            <div ref={detailsRef}>
              <button
                onClick={() => setShowKvDetails((v) => !v)}
                className="ml-1 w-4 h-4 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-none"
                aria-label="Details zu Sozialabgaben"
              >
                ?
              </button>
              {showKvDetails && (
                <div className="absolute left-0 top-full mt-1 z-50 w-64 max-w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl p-3 space-y-2 text-xs">
                  <p className="font-semibold text-gray-800 dark:text-white">Details Sozialabgaben</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Krankenversicherung (KV)</span>
                      <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.totalKvMonthly)}</span>
                    </div>
                    <div className="flex justify-between pl-3 text-gray-400 dark:text-slate-500">
                      <span>Basisbeitrag (½)</span>
                      <span>{fmtPct(7.3)}</span>
                    </div>
                    <div className="flex justify-between pl-3 text-gray-400 dark:text-slate-500">
                      <span>Zusatzbeitrag (½)</span>
                      <span>{fmtPct(taxSettings.kvZusatzbeitrag / 2)}</span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-slate-600 pt-1.5 flex justify-between">
                      <span className="text-gray-500 dark:text-slate-400">Pflegeversicherung (PV)</span>
                      <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.totalPvMonthly)}</span>
                    </div>
                    <div className="flex justify-between pl-3 text-gray-400 dark:text-slate-500">
                      <span>{taxSettings.hasChildren ? 'mit Kindern' : 'ohne Kinder'}</span>
                      <span>{fmtPct(pvRate)}</span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-slate-600 pt-1.5 flex justify-between font-semibold text-gray-800 dark:text-white">
                      <span>Gesamt</span>
                      <span className="tabular-nums">{fmt(breakdown.totalSocialMonthly)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />
        {kapitalabgabenMonthly > 0 && (
          <SummaryRow
            label="Kapitalabgaben"
            value={kapitalabgabenMonthly}
            color="bg-rose-400"
            max={breakdown.totalGrossMonthly}
            infoButton={
              <div ref={taxDetailsRef}>
                <button
                  onClick={() => setShowTaxDetails((v) => !v)}
                  className="ml-1 w-4 h-4 rounded-full bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-none"
                  aria-label="Details zu Kapitalabgaben"
                >
                  ?
                </button>
                {showTaxDetails && (
                  <div className="absolute left-0 bottom-full mb-1 z-50 w-72 max-w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl p-3 space-y-2 text-xs">
                    <p className="font-semibold text-gray-800 dark:text-white">Details Kapitalabgaben</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">ETF-Erträge (jährlich)</span>
                        <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.etfAnnualGross)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 dark:text-slate-500">
                        <span>− Sparerpauschbetrag</span>
                        <span className="tabular-nums">−{fmt(Math.min(breakdown.etfAnnualGross, SPARERPAUSCHBETRAG))}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 dark:border-slate-600 pt-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Steuerpflichtig (jährlich)</span>
                        <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.kapitalertragsteuerBase)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Abgeltungsteuer (25 %)</span>
                        <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.kapitalertragsteuerAnnual)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Solidaritätszuschlag (5,5 %)</span>
                        <span className="font-medium text-gray-800 dark:text-white tabular-nums">{fmt(breakdown.soliAnnual)}</span>
                      </div>
                      <div className="border-t border-gray-100 dark:border-slate-600 pt-1.5 flex justify-between font-semibold text-gray-800 dark:text-white">
                        <span>Gesamt / Monat</span>
                        <span className="tabular-nums">{fmt(kapitalabgabenMonthly)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            }
          />
        )}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-2">
          <SummaryRow
            label="Netto (geschätzt)"
            value={breakdown.netMonthly}
            color="bg-emerald-500"
            max={breakdown.totalGrossMonthly}
            highlight
          />
        </div>
      </div>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: number;
  color: string;
  max: number;
  highlight?: boolean;
  infoButton?: React.ReactNode;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, color, max, highlight, infoButton }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="relative flex items-center gap-3">
      <span className={`text-xs w-28 sm:w-48 flex-shrink-0 flex items-center ${highlight ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>
        {label}
        {infoButton}
      </span>
      <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs w-20 sm:w-24 text-right flex-shrink-0 tabular-nums ${highlight ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>
        {fmtNum(value)} €
      </span>
    </div>
  );
};
