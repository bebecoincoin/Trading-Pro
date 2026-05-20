import Database from 'better-sqlite3';
import * as crypto from 'node:crypto';

let db: Database.Database | null = null;

export async function initDatabase(file: string) {
  db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'local',
      avatar_url TEXT,
      bio TEXT,
      verified INTEGER DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires INTEGER,
      created_at INTEGER NOT NULL,
      last_login INTEGER
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      quantity REAL NOT NULL,
      avg_price REAL NOT NULL,
      notes TEXT,
      opened_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      UNIQUE(user_id, symbol, kind),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_positions_user ON positions(user_id);
    CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

    -- ===== Simulateur de trading (paper trading) =====
    CREATE TABLE IF NOT EXISTS paper_account (
      user_id INTEGER PRIMARY KEY,
      cash_balance REAL NOT NULL,
      initial_balance REAL NOT NULL,
      created_at INTEGER NOT NULL,
      reset_count INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS paper_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      quantity REAL NOT NULL,
      avg_price REAL NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, symbol, kind),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS paper_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      side TEXT NOT NULL,
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      fee REAL NOT NULL DEFAULT 0,
      realized_pnl REAL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_paper_positions_user ON paper_positions(user_id);
    CREATE INDEX IF NOT EXISTS idx_paper_trades_user ON paper_trades(user_id);
  `);

  // Migration : ajouter colonnes manquantes si la DB est ancienne
  try {
    db.prepare('ALTER TABLE users ADD COLUMN public_id TEXT').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE users ADD COLUMN bio TEXT').run();
  } catch {}

  // Generer un public_id pour les comptes existants qui n'en ont pas
  const rows = db.prepare("SELECT id FROM users WHERE public_id IS NULL OR public_id = ''").all() as { id: number }[];
  for (const r of rows) {
    const uuid = crypto.randomUUID();
    db.prepare('UPDATE users SET public_id = ? WHERE id = ?').run(uuid, r.id);
  }
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized');
  return db;
}
