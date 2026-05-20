import { ipcMain } from 'electron';
import axios from 'axios';
import { getDb } from './db';
import { getUserIdFromToken } from './auth';
import { env } from './env';

/**
 * Simulateur de trading (paper trading).
 *
 * Modele simplifie :
 * - Compte initial : 1 000 000 USD virtuels.
 * - Frais simules : 0.1% sur chaque ordre (taux taker spot Binance).
 * - Pas de short, pas de marge, pas d'effet de levier.
 * - Long only : on ne peut vendre que ce qu'on possede.
 * - Prix executes au prix marche en temps reel (snapshot au moment du clic).
 */

// "Illimite" : 999 milliards de dollars (depasse toute capitalisation crypto sauf BTC en mode bull total)
// L'utilisateur peut aussi configurer un montant personnalise au reset
export const UNLIMITED_BALANCE = 999_000_000_000;
const INITIAL_BALANCE = UNLIMITED_BALANCE;
const FEE_RATE = 0.001; // 0.1%

function auth(token: string): number | null {
  return getUserIdFromToken(token);
}

function ensureAccount(userId: number) {
  const db = getDb();
  const a = db.prepare('SELECT * FROM paper_account WHERE user_id = ?').get(userId);
  if (!a) {
    db.prepare(
      `INSERT INTO paper_account (user_id, cash_balance, initial_balance, created_at, reset_count)
       VALUES (?, ?, ?, ?, 0)`
    ).run(userId, INITIAL_BALANCE, INITIAL_BALANCE, Date.now());
  }
}

async function fetchPriceLive(symbol: string, kind: 'crypto' | 'stock'): Promise<number | null> {
  try {
    if (kind === 'crypto') {
      // CoinGecko simple/price endpoint
      const headers: any = {};
      const demoKey = env('COINGECKO_DEMO_KEY');
      if (demoKey) headers['x-cg-demo-api-key'] = demoKey;
      const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          symbol
        )}&vs_currencies=usd`,
        { headers, timeout: 10000 }
      );
      return data?.[symbol]?.usd ?? null;
    } else {
      const { data } = await axios.get(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 TradingPro/1.0' },
          timeout: 10000,
        }
      );
      const q = data?.quoteResponse?.result?.[0];
      return q?.regularMarketPrice ?? null;
    }
  } catch {
    return null;
  }
}

export function registerPaperTradingHandlers() {
  // ----- Compte -----
  ipcMain.handle('paper:account', async (_e, token: string) => {
    const userId = auth(token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    ensureAccount(userId);
    const db = getDb();
    const account: any = db
      .prepare('SELECT * FROM paper_account WHERE user_id = ?')
      .get(userId);
    return { ok: true, data: account };
  });

  // ----- Positions -----
  ipcMain.handle('paper:positions', async (_e, token: string) => {
    const userId = auth(token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const db = getDb();
    const items = db
      .prepare('SELECT * FROM paper_positions WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId);
    return { ok: true, data: items };
  });

  // ----- Historique -----
  ipcMain.handle('paper:trades', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const db = getDb();
    const limit = Math.min(parseInt(payload?.limit ?? 100, 10), 500);
    const items = db
      .prepare(
        'SELECT * FROM paper_trades WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
      )
      .all(userId, limit);
    return { ok: true, data: items };
  });

  // ----- Acheter -----
  ipcMain.handle('paper:buy', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    ensureAccount(userId);
    const { symbol, name, kind, quantity } = payload;
    if (!symbol || !kind || !quantity || quantity <= 0)
      return { ok: false, error: 'Donnees invalides.' };

    const price = await fetchPriceLive(symbol, kind);
    if (!price || price <= 0)
      return { ok: false, error: 'Impossible de recuperer le prix marche.' };

    const gross = price * quantity;
    const fee = gross * FEE_RATE;
    const total = gross + fee;

    const db = getDb();
    const account: any = db
      .prepare('SELECT * FROM paper_account WHERE user_id = ?')
      .get(userId);
    if (account.cash_balance < total) {
      return {
        ok: false,
        error: `Solde insuffisant. Necessaire : ${total.toFixed(2)} $ (dont ${fee.toFixed(2)} $ de frais).`,
      };
    }

    const tx = db.transaction(() => {
      // Update cash
      db.prepare('UPDATE paper_account SET cash_balance = cash_balance - ? WHERE user_id = ?').run(
        total,
        userId
      );

      // Upsert position (weighted average price)
      const existing: any = db
        .prepare('SELECT * FROM paper_positions WHERE user_id = ? AND symbol = ? AND kind = ?')
        .get(userId, symbol, kind);
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newAvg =
          (existing.avg_price * existing.quantity + price * quantity) / newQty;
        db.prepare(
          'UPDATE paper_positions SET quantity = ?, avg_price = ? WHERE id = ?'
        ).run(newQty, newAvg, existing.id);
      } else {
        db.prepare(
          `INSERT INTO paper_positions (user_id, symbol, name, kind, quantity, avg_price, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(userId, symbol, name || symbol, kind, quantity, price, Date.now());
      }

      // Record trade
      db.prepare(
        `INSERT INTO paper_trades (user_id, symbol, name, kind, side, quantity, price, total, fee, created_at)
         VALUES (?, ?, ?, ?, 'buy', ?, ?, ?, ?, ?)`
      ).run(userId, symbol, name || symbol, kind, quantity, price, total, fee, Date.now());
    });
    tx();

    return { ok: true, price, fee, total };
  });

  // ----- Vendre -----
  ipcMain.handle('paper:sell', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    ensureAccount(userId);
    const { symbol, kind, quantity } = payload;
    if (!symbol || !kind || !quantity || quantity <= 0)
      return { ok: false, error: 'Donnees invalides.' };

    const db = getDb();
    const pos: any = db
      .prepare('SELECT * FROM paper_positions WHERE user_id = ? AND symbol = ? AND kind = ?')
      .get(userId, symbol, kind);
    if (!pos) return { ok: false, error: 'Aucune position sur cet actif.' };
    if (pos.quantity < quantity - 1e-12)
      return {
        ok: false,
        error: `Quantite insuffisante (tu possedes ${pos.quantity}).`,
      };

    const price = await fetchPriceLive(symbol, kind);
    if (!price || price <= 0)
      return { ok: false, error: 'Impossible de recuperer le prix marche.' };

    const gross = price * quantity;
    const fee = gross * FEE_RATE;
    const net = gross - fee;
    const realized = (price - pos.avg_price) * quantity - fee;

    const tx = db.transaction(() => {
      // Cash +net
      db.prepare('UPDATE paper_account SET cash_balance = cash_balance + ? WHERE user_id = ?').run(
        net,
        userId
      );

      // Update or remove position
      const newQty = pos.quantity - quantity;
      if (newQty <= 1e-12) {
        db.prepare('DELETE FROM paper_positions WHERE id = ?').run(pos.id);
      } else {
        db.prepare('UPDATE paper_positions SET quantity = ? WHERE id = ?').run(newQty, pos.id);
      }

      // Record trade
      db.prepare(
        `INSERT INTO paper_trades (user_id, symbol, name, kind, side, quantity, price, total, fee, realized_pnl, created_at)
         VALUES (?, ?, ?, ?, 'sell', ?, ?, ?, ?, ?, ?)`
      ).run(
        userId,
        symbol,
        pos.name,
        kind,
        quantity,
        price,
        net,
        fee,
        realized,
        Date.now()
      );
    });
    tx();

    return { ok: true, price, fee, net, realized };
  });

  // ----- Reset (accepte un solde de depart personnalise) -----
  ipcMain.handle('paper:reset', async (_e, payload: any) => {
    // Compat retro : si l'ancien client envoie juste un token string
    const token = typeof payload === 'string' ? payload : payload?.token;
    const customBalance = typeof payload === 'object' ? Number(payload?.balance) : NaN;
    const userId = auth(token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const balance =
      Number.isFinite(customBalance) && customBalance > 0
        ? Math.min(customBalance, UNLIMITED_BALANCE)
        : INITIAL_BALANCE;
    const db = getDb();
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM paper_positions WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM paper_trades WHERE user_id = ?').run(userId);
      const exists = db.prepare('SELECT user_id FROM paper_account WHERE user_id = ?').get(userId);
      if (exists) {
        db.prepare(
          'UPDATE paper_account SET cash_balance = ?, initial_balance = ?, reset_count = reset_count + 1, created_at = ? WHERE user_id = ?'
        ).run(balance, balance, Date.now(), userId);
      } else {
        db.prepare(
          'INSERT INTO paper_account (user_id, cash_balance, initial_balance, created_at, reset_count) VALUES (?, ?, ?, ?, 0)'
        ).run(userId, balance, balance, Date.now());
      }
    });
    tx();
    return { ok: true, balance };
  });

  // ----- Quote actuelle (helper) -----
  ipcMain.handle('paper:quote', async (_e, payload: any) => {
    const { symbol, kind } = payload;
    const price = await fetchPriceLive(symbol, kind);
    if (price == null) return { ok: false, error: 'Prix indisponible.' };
    return { ok: true, price };
  });
}
