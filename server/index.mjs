import express from 'express';
import { createHash } from 'crypto';
import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
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
const DIST_DIR = join(__dirname, '..', 'dist');
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

// POST /api/sync/data — client pushes all localStorage data to the server
app.post('/api/sync/data', (req, res) => {
  const { data } = req.body ?? {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid payload: data must be an object' });
  }

  const now = Date.now();
  const entries = Object.entries(data).filter(
    ([, v]) => typeof v === 'string'
  );

  const replaceAll = db.transaction(() => {
    // Replace the entire stored dataset in one atomic operation
    stmtDeleteAll.run();
    for (const [key, value] of entries) {
      stmtUpsert.run(key, value, now);
    }
  });

  replaceAll();

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
