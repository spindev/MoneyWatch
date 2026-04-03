import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { PortfolioChart } from './components/PortfolioChart';
import { ForecastChart } from './components/ForecastChart';
import { HoldingsTable } from './components/HoldingsTable';
import { SettingsPage } from './components/SettingsPage';
import { MarketDataPage } from './components/MarketDataPage';
import { CsvImportModal } from './components/CsvImportModal';
import { ManualBuyModal } from './components/ManualBuyModal';
import { SaleSimulationModal } from './components/SaleSimulationModal';
import {
  DEMO_ETFS,
  fetchQuotes,
  fetchHistorical,
  buildHoldings,
  buildPortfolioHistory,
  type HistoricalPoint,
  type TickerTransactions,
  type QuoteResult,
} from './services/financeService';
import { getSettings, saveSettings } from './services/settingsService';
import { getImportedLots, saveImportedLots, getImportedSales, saveImportedSales } from './services/importedLotsService';
import { parseBrokerCsv } from './utils/csvParser';
import {
  calculateTotalValue,
  calculateTotalCost,
  calculateTotalGain,
  calculateTotalGainPercent,
  formatCurrency,
  formatPercent,
  todayIsoString,
  buildForecast,
} from './utils/calculations';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { Holding, PortfolioSnapshot, PurchaseLot, SaleLot, Settings } from './types';
import type { AppId } from '../../components/AppSwitcher';

const CURRENCY = 'EUR';
const LOCALE = 'de-DE';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';
type Page = 'portfolio' | 'settings';
type ChartView = 'entwicklung' | 'prognose';

const TIME_RANGES: TimeRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

interface PortfolioAppProps {
  activeApp: AppId;
  onSwitchApp: (app: AppId) => void;
}

export function PortfolioApp({ activeApp, onSwitchApp }: PortfolioAppProps) {
  const [page, setPage] = useState<Page>('portfolio');
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [chartView, setChartView] = useState<ChartView>('entwicklung');

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioSnapshot[]>([]);
  const [rawQuotes, setRawQuotes] = useState<QuoteResult[]>([]);
  const [rawHistories, setRawHistories] = useState<Record<string, HistoricalPoint[]>>({});

  const [settings, setSettings] = useState<Settings>(getSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataUpdatedAt, setDataUpdatedAt] = useState<string | null>(null);
  const [lastTradingDate, setLastTradingDate] = useState<string | null>(null);

  const importedLotsRef = useRef<Record<string, PurchaseLot[]>>(getImportedLots());
  const importedSalesRef = useRef<Record<string, SaleLot[]>>(getImportedSales());
  const [csvImportLots, setCsvImportLots] = useState<import('./utils/csvParser').CsvLot[] | null>(null);
  const [showManualBuy, setShowManualBuy] = useState(false);
  const [showMarketData, setShowMarketData] = useState(false);
  const [saleSimulationHolding, setSaleSimulationHolding] = useState<Holding | null>(null);
  const [showPortfolioSimulation, setShowPortfolioSimulation] = useState(false);

  const { syncStatus, triggerSync } = useSyncStatus();

  const isDark = settings.theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tickers = DEMO_ETFS.map((e) => e.ticker);

      const historicalResults = await Promise.all(
        tickers.map((ticker) => fetchHistorical(ticker).catch(() => [] as HistoricalPoint[]))
      );
      const rawHistoriesLocal: Record<string, HistoricalPoint[]> = {};
      tickers.forEach((ticker, i) => { rawHistoriesLocal[ticker] = historicalResults[i]; });

      const avgBuyPrices: Record<string, number> = {};
      DEMO_ETFS.forEach((def) => {
        const history = rawHistoriesLocal[def.ticker];
        avgBuyPrices[def.ticker] = history.length > 0 ? history[0].close : 0;
      });

      const { quotes, updatedAt } = await fetchQuotes(tickers);

      const newHoldings = buildHoldings(DEMO_ETFS, quotes, avgBuyPrices, rawHistoriesLocal, importedLotsRef.current, importedSalesRef.current);

      const transactionsByTicker: Record<string, TickerTransactions> = {};
      DEMO_ETFS.forEach((def) => {
        const staticLots = (def.lots ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
        const csvBuyLots = def.isin ? (importedLotsRef.current[def.isin] ?? []) : [];
        const csvSaleLots = def.isin ? (importedSalesRef.current[def.isin] ?? []) : [];
        const allBuyLots = [...staticLots, ...csvBuyLots].sort((a, b) => a.date.localeCompare(b.date));
        const allSaleLots = [...csvSaleLots].sort((a, b) => a.date.localeCompare(b.date));
        if (allBuyLots.length > 0 || allSaleLots.length > 0) {
          transactionsByTicker[def.ticker] = { buyLots: allBuyLots, saleLots: allSaleLots };
        }
      });

      const sharesByTicker: Record<string, number> = {};
      const costBasisByTicker: Record<string, number> = {};
      newHoldings.forEach((h) => {
        sharesByTicker[h.ticker] = h.shares;
        costBasisByTicker[h.ticker] = h.avgBuyPrice;
      });

      const newPortfolioHistory = buildPortfolioHistory(rawHistoriesLocal, DEMO_ETFS, avgBuyPrices, sharesByTicker, costBasisByTicker, transactionsByTicker);

      let firstPurchaseDate: string | null = null;
      Object.values(transactionsByTicker).forEach((txns) => {
        if (txns.buyLots.length > 0) {
          const earliest = txns.buyLots[0].date;
          if (!firstPurchaseDate || earliest < firstPurchaseDate) {
            firstPurchaseDate = earliest;
          }
        }
      });
      const boundedHistory = firstPurchaseDate
        ? newPortfolioHistory.filter((s) => s.date >= (firstPurchaseDate as string))
        : newPortfolioHistory;

      let latestTradingDate: string | null = null;
      Object.values(rawHistoriesLocal).forEach((history) => {
        if (history.length > 0) {
          const lastDate = history[history.length - 1].date;
          if (!latestTradingDate || lastDate > latestTradingDate) {
            latestTradingDate = lastDate;
          }
        }
      });

      setHoldings(newHoldings);
      setPortfolioHistory(boundedHistory);
      setRawQuotes(quotes);
      setRawHistories(rawHistoriesLocal);
      setLastUpdated(new Date());
      setDataUpdatedAt(updatedAt);
      setLastTradingDate(latestTradingDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Daten konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSaveSettings = (s: Settings) => {
    saveSettings(s);
    setSettings(s);
  };

  const handleClearPortfolio = () => {
    importedLotsRef.current = {};
    importedSalesRef.current = {};
    saveImportedLots({});
    saveImportedSales({});
    setPage('portfolio');
    loadInitialData();
    triggerSync();
  };

  const handleManualBuyConfirm = (isin: string, lot: PurchaseLot) => {
    const existing = importedLotsRef.current[isin] ?? [];
    const updated = [...existing, lot].sort((a, b) => a.date.localeCompare(b.date));
    const newLots = { ...importedLotsRef.current, [isin]: updated };
    importedLotsRef.current = newLots;
    saveImportedLots(newLots);
    setShowManualBuy(false);
    loadInitialData();
    triggerSync();
  };

  const readFileAsText = (file: File, encoding: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) ?? '');
      reader.onerror = reject;
      reader.readAsText(file, encoding);
    });

  const handleCsvUpload = async (file: File) => {
    const knownIsins = new Set(DEMO_ETFS.map((e) => e.isin).filter(Boolean) as string[]);
    const knownWkns = new Set(DEMO_ETFS.map((e) => e.wkn).filter(Boolean) as string[]);

    const parseAndFilter = (text: string) =>
      parseBrokerCsv(text).filter(
        (l) => knownIsins.has(l.isin) || (l.wkn && knownWkns.has(l.wkn)),
      );

    let filtered = parseAndFilter(await readFileAsText(file, 'UTF-8'));
    if (filtered.length === 0) {
      filtered = parseAndFilter(await readFileAsText(file, 'windows-1252'));
    }

    setCsvImportLots(filtered);
  };

  const handleImportConfirm = (selectedByIsin: Record<string, PurchaseLot[]>, salesByIsin: Record<string, SaleLot[]>) => {
    const lotKey = (l: PurchaseLot) => `${l.date}|${l.shares}|${l.buyPrice}`;
    const mergedLots: Record<string, PurchaseLot[]> = { ...importedLotsRef.current };
    Object.entries(selectedByIsin).forEach(([isin, newLots]) => {
      const existing = mergedLots[isin] ?? [];
      const seen = new Set(existing.map(lotKey));
      const unique = newLots.filter((l) => !seen.has(lotKey(l)));
      mergedLots[isin] = [...existing, ...unique].sort((a, b) => a.date.localeCompare(b.date));
    });
    importedLotsRef.current = mergedLots;
    saveImportedLots(mergedLots);

    const saleKey = (l: SaleLot) => `${l.date}|${l.shares}`;
    const mergedSales: Record<string, SaleLot[]> = { ...importedSalesRef.current };
    Object.entries(salesByIsin).forEach(([isin, newSales]) => {
      const existing = mergedSales[isin] ?? [];
      const seen = new Set(existing.map(saleKey));
      const unique = newSales.filter((l) => !seen.has(saleKey(l)));
      mergedSales[isin] = [...existing, ...unique].sort((a, b) => a.date.localeCompare(b.date));
    });
    importedSalesRef.current = mergedSales;
    saveImportedSales(mergedSales);

    setCsvImportLots(null);
    loadInitialData();
    triggerSync();
  };

  const totalValue = calculateTotalValue(holdings);
  const totalCost = calculateTotalCost(holdings);
  const totalGain = calculateTotalGain(holdings);
  const totalGainPercent = calculateTotalGainPercent(holdings);
  const isPositive = totalGain >= 0;
  const todayStr = todayIsoString();
  const isNonTradingDay = !!lastTradingDate && lastTradingDate < todayStr;

  const forecastData = buildForecast(totalValue, totalCost, settings.monthlySavings, settings.forecastYears);

  const periodReturn = useMemo(() => {
    const days =
      timeRange === '1M' ? 30 :
      timeRange === '3M' ? 90 :
      timeRange === '6M' ? 180 :
      timeRange === '1Y' ? 365 :
      portfolioHistory.length;
    const filtered = portfolioHistory.slice(-days);
    if (filtered.length < 2) return null;
    const startValue = filtered[0].totalValue;
    const endValue = filtered[filtered.length - 1].totalValue;
    if (startValue === 0) return null;
    return ((endValue - startValue) / startValue) * 100;
  }, [portfolioHistory, timeRange]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <Header
        page={page}
        onNavigate={setPage}
        isLoading={isLoading}
        hasError={!!error && !lastUpdated}
        onCsvUpload={handleCsvUpload}
        onManualBuy={() => setShowManualBuy(true)}
        activeApp={activeApp}
        onSwitchApp={onSwitchApp}
        syncStatus={syncStatus}
        onSync={triggerSync}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-xl px-5 py-3 flex items-center gap-3">
              <svg className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              <button onClick={loadInitialData} className="ml-auto text-red-600 dark:text-red-300 hover:text-red-900 dark:hover:text-white text-xs underline">
                Erneut versuchen
              </button>
            </div>
          )}

          {isLoading && holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">Lade Kurse von Yahoo Finance…</p>
            </div>
          ) : !isLoading && holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Portfolio leer</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 max-w-xs">
                  Importiere deine Käufe über den CSV-Upload-Button in der Kopfzeile.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  title="Portfoliowert"
                  value={formatCurrency(totalValue, CURRENCY, LOCALE)}
                  positive={null}
                />
                <StatCard
                  title="Gesamtkosten"
                  value={formatCurrency(totalCost, CURRENCY, LOCALE)}
                  positive={null}
                />
                <StatCard
                  title="Gesamtgewinn"
                  value={formatCurrency(totalGain, CURRENCY, LOCALE)}
                  positive={isPositive}
                />
                <StatCard
                  title="Gesamtrendite"
                  value={formatPercent(totalGainPercent)}
                  positive={isPositive}
                />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 text-xs w-fit mb-3">
                  <button
                    onClick={() => setChartView('entwicklung')}
                    className={`px-3 py-1.5 transition-colors ${
                      chartView === 'entwicklung'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Portfolio-Entwicklung
                  </button>
                  <button
                    onClick={() => setChartView('prognose')}
                    className={`px-3 py-1.5 transition-colors border-l border-gray-200 dark:border-slate-600 ${
                      chartView === 'prognose'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Prognose
                  </button>
                </div>

                {chartView === 'entwicklung' && (
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="flex gap-1">
                      {TIME_RANGES.map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-2 sm:px-3 py-1 text-xs rounded-md transition-colors ${
                            timeRange === range
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                    {periodReturn !== null && (
                      <span className={`text-sm font-semibold ${periodReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatPercent(periodReturn)}
                      </span>
                    )}
                  </div>
                )}

                {chartView === 'entwicklung' ? (
                  <PortfolioChart data={portfolioHistory} timeRange={timeRange} />
                ) : (
                  <ForecastChart
                    data={forecastData}
                    monthlySavings={settings.monthlySavings}
                    forecastYears={settings.forecastYears}
                    totalCost={totalCost}
                  />
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-gray-900 dark:text-white font-semibold text-base sm:text-lg">Positionen</h2>
                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">Alle ETF-Positionen und Performance</p>
                  </div>
                  <button
                    onClick={() => setShowPortfolioSimulation(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Verkaufssimulation
                  </button>
                </div>
                <HoldingsTable
                  holdings={holdings}
                  onSimulateSale={(h) => setSaleSimulationHolding(h)}
                />
              </div>

              <footer className="text-center text-gray-400 dark:text-slate-500 text-xs pb-4">
                PortfolioWatch — Kurse via Yahoo Finance
                {isNonTradingDay && (
                  <span className="block mt-0.5 text-amber-500/80 dark:text-amber-400/70">
                    Kein Handel heute – letzter Kurs vom{' '}
                    {new Date(lastTradingDate + 'T12:00:00').toLocaleDateString(LOCALE, {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </footer>
            </>
          )}
        </>
      </main>

      {page === 'settings' && (
        <SettingsPage
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setPage('portfolio')}
          onClearPortfolio={handleClearPortfolio}
          onViewMarketData={() => { setPage('portfolio'); setShowMarketData(true); }}
        />
      )}

      {showMarketData && (
        <MarketDataPage
          etfDefs={DEMO_ETFS}
          quotes={rawQuotes}
          histories={rawHistories}
          updatedAt={dataUpdatedAt}
          onClose={() => setShowMarketData(false)}
        />
      )}

      {csvImportLots !== null && (
        <CsvImportModal
          lots={csvImportLots}
          knownEtfs={DEMO_ETFS}
          onConfirm={handleImportConfirm}
          onClose={() => setCsvImportLots(null)}
        />
      )}

      {showManualBuy && (
        <ManualBuyModal
          knownEtfs={DEMO_ETFS}
          onConfirm={handleManualBuyConfirm}
          onClose={() => setShowManualBuy(false)}
        />
      )}

      {saleSimulationHolding && (
        <SaleSimulationModal
          holdings={holdings}
          initialHolding={saleSimulationHolding}
          onClose={() => setSaleSimulationHolding(null)}
        />
      )}

      {showPortfolioSimulation && !saleSimulationHolding && (
        <SaleSimulationModal
          holdings={holdings}
          onClose={() => setShowPortfolioSimulation(false)}
        />
      )}
    </div>
  );
}
