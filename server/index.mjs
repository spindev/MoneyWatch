import express from 'express';
import { createHash } from 'crypto';
import Database from 'better-sqlite3';
import { mkdirSync, writeFileSync, existsSync, statSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Data directory & SQLite setup ─────────────────────────────────────────────
const DATA_DIR = process.env.DATA_DIR || '/data';
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, 'moneywatch.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS sync_store (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

// Prepared statements
const stmtAll    = db.prepare('SELECT key, value FROM sync_store ORDER BY key');
const stmtUpsert = db.prepare(
  'INSERT OR REPLACE INTO sync_store (key, value, updated_at) VALUES (?, ?, ?)'
);
const stmtDeleteAll = db.prepare('DELETE FROM sync_store');
const stmtDeleteKey = db.prepare('DELETE FROM sync_store WHERE key = ?');
// ── Hash helper ───────────────────────────────────────────────────────────────
function computeHash(data) {
  const sorted = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  );
  return createHash('sha256')
    .update(JSON.stringify(sorted))
    .digest('hex')
    .substring(0, 16);
}

// ── Finance data live-refresh (Docker only) ───────────────────────────────────
const DIST_DIR = join(__dirname, '..', 'dist');
const FINANCE_DATA_DIR = join(DIST_DIR, 'data');

// Read ETF tickers from the bundled etfs.json (copied alongside server/index.mjs
// by the Dockerfile from src/apps/portfolio/etfs.json).
let FINANCE_TICKERS = [];
try {
  const etfsPath = join(__dirname, 'etfs.json');
  const etfs = JSON.parse(readFileSync(etfsPath, 'utf8'));
  FINANCE_TICKERS = etfs.map((e) => e.ticker);
} catch {
  console.warn('[finance] etfs.json not found – live market-data refresh disabled.');
}

const YF_BASE = 'https://query2.finance.yahoo.com';
const YF_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  Accept: 'application/json',
};
const YF_TIMEOUT_MS = 20000;

function safeFilename(ticker) {
  return ticker.replace(/[^\w]/g, '_');
}

async function yfFetch(url) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), YF_TIMEOUT_MS);
  try {
    return await fetch(url, { headers: YF_HEADERS, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Fetch the latest closing price for a single ticker.
 * Returns { price, currency }.
 */
async function fetchCurrentQuote(ticker) {
  const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
  const res = await yfFetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) throw new Error('No chart data');
  const closes = (result.indicators?.quote?.[0]?.close ?? []).filter((c) => c != null && c > 0);
  const price = closes[closes.length - 1] ?? 0;
  const currency = result.meta?.currency ?? 'USD';
  return { price, currency };
}

/**
 * Fetch 5-year daily history for a single ticker.
 * Returns { history: [{ date, close }] }.
 */
async function fetchHistoricalQuote(ticker) {
  const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5y`;
  const res = await yfFetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) throw new Error('No chart data');
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const history = timestamps
    .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().split('T')[0], close: closes[i] }))
    .filter((p) => p.close != null && p.close > 0);
  return { history };
}

/** Refresh current quotes for all tickers and write quotes.json. */
async function refreshCurrentQuotes() {
  if (FINANCE_TICKERS.length === 0) return;
  mkdirSync(FINANCE_DATA_DIR, { recursive: true });

  const quotes = [];
  for (const ticker of FINANCE_TICKERS) {
    try {
      const { price, currency } = await fetchCurrentQuote(ticker);
      quotes.push({ ticker, price, currency });
    } catch (err) {
      console.error(`[finance] Quote fetch failed for ${ticker}: ${err.message}`);
    }
  }
  if (quotes.length === 0) {
    console.warn('[finance] All quote fetches failed – quotes.json not updated.');
    return;
  }
  const updatedAt = new Date().toISOString();
  writeFileSync(
    join(FINANCE_DATA_DIR, 'quotes.json'),
    JSON.stringify({ updatedAt, quotes }, null, 2),
  );
  console.log(`[finance] Quotes updated (${quotes.length}/${FINANCE_TICKERS.length} tickers) at ${updatedAt}`);
}

/** Refresh historical data for all tickers and write per-ticker files. */
async function refreshHistoricalData() {
  if (FINANCE_TICKERS.length === 0) return;
  mkdirSync(FINANCE_DATA_DIR, { recursive: true });

  let updated = 0;
  const updatedAt = new Date().toISOString();
  for (const ticker of FINANCE_TICKERS) {
    try {
      const { history } = await fetchHistoricalQuote(ticker);
      writeFileSync(
        join(FINANCE_DATA_DIR, `historical-${safeFilename(ticker)}.json`),
        JSON.stringify({ updatedAt, ticker, history }, null, 2),
      );
      updated++;
    } catch (err) {
      console.error(`[finance] Historical fetch failed for ${ticker}: ${err.message}`);
    }
  }
  console.log(`[finance] Historical data updated (${updated}/${FINANCE_TICKERS.length} tickers) at ${updatedAt}`);
}

/** Return milliseconds until the next occurrence of targetHour:00:00 local time. */
function msUntilHour(targetHour) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

if (FINANCE_TICKERS.length > 0) {
  // ── Current quotes: refresh at startup, then every FINANCE_QUOTE_INTERVAL_MS ─
  const QUOTE_INTERVAL_MS =
    parseInt(process.env.FINANCE_QUOTE_INTERVAL_MS ?? '', 10) || 5 * 60 * 1000;

  // Fetch immediately on startup (the build-time data may be hours old).
  refreshCurrentQuotes().catch((err) =>
    console.error('[finance] Initial quote refresh failed:', err)
  );
  setInterval(refreshCurrentQuotes, QUOTE_INTERVAL_MS);
  console.log(`[finance] Quote refresh interval: ${QUOTE_INTERVAL_MS / 1000}s`);

  // ── Historical data: once per day at 03:00, or immediately if the existing ──
  //    files are older than 24 hours.
  const HISTORICAL_HOUR = parseInt(process.env.FINANCE_HISTORICAL_HOUR ?? '', 10) || 3;
  const HISTORICAL_MAX_AGE_MS = 24 * 60 * 60 * 1000;

  // Use the first ticker's historical file to determine staleness.
  const firstHistoricalFile = join(
    FINANCE_DATA_DIR,
    `historical-${safeFilename(FINANCE_TICKERS[0])}.json`,
  );
  const historicalStale =
    !existsSync(firstHistoricalFile) ||
    Date.now() - statSync(firstHistoricalFile).mtimeMs > HISTORICAL_MAX_AGE_MS;

  if (historicalStale) {
    refreshHistoricalData().catch((err) =>
      console.error('[finance] Initial historical refresh failed:', err)
    );
  }

  // Schedule daily refresh at HISTORICAL_HOUR:00.
  setTimeout(() => {
    refreshHistoricalData().catch((err) =>
      console.error('[finance] Scheduled historical refresh failed:', err)
    );
    setInterval(
      () =>
        refreshHistoricalData().catch((err) =>
          console.error('[finance] Scheduled historical refresh failed:', err)
        ),
      HISTORICAL_MAX_AGE_MS,
    );
  }, msUntilHour(HISTORICAL_HOUR));

  console.log(`[finance] Historical refresh scheduled daily at ${HISTORICAL_HOUR.toString().padStart(2, '0')}:00`);
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '10mb' }));

// Rate-limit the sync API: max 60 requests per minute per IP
const syncLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve the compiled React SPA
app.use(express.static(DIST_DIR));

// Apply rate limiting to all /api/sync routes
app.use('/api/sync', syncLimiter);

// GET /api/sync/hash — returns the hash of all stored data
app.get('/api/sync/hash', (_req, res) => {
  const rows = stmtAll.all();
  const data = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({ hash: computeHash(data) });
});

// GET /api/sync/data — returns all stored data
app.get('/api/sync/data', (_req, res) => {
  const rows = stmtAll.all();
  const data = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({ hash: computeHash(data), data });
});

// POST /api/sync/data — client pushes localStorage data to the server
app.post('/api/sync/data', (req, res) => {
  const { data, scope } = req.body ?? {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid payload: data must be an object' });
  }

  const now = Date.now();
  const entries = Object.entries(data).filter(
    ([, v]) => typeof v === 'string'
  );

  const upsertData = db.transaction(() => {
    if (Array.isArray(scope) && scope.length > 0) {
      // Per-app backup: only touch keys within the given scope.
      // Delete scoped keys that were not included in the payload (intentional deletions).
      const dataKeys = new Set(entries.map(([k]) => k));
      for (const key of scope) {
        if (!dataKeys.has(key)) {
          stmtDeleteKey.run(key);
        }
      }
    } else {
      // Legacy / full backup: replace the entire stored dataset.
      stmtDeleteAll.run();
    }
    for (const [key, value] of entries) {
      stmtUpsert.run(key, value, now);
    }
  });

  upsertData();

  const rows = stmtAll.all();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({ hash: computeHash(stored) });
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(join(DIST_DIR, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '', 10) || 3000;
app.listen(PORT, () => {
  console.log(`MoneyWatch server listening on port ${PORT}`);
});
