import { ipcMain } from 'electron';
import { getDb } from './db';
import { getUserIdFromToken } from './auth';

function auth(token: string) {
  const id = getUserIdFromToken(token);
  return id;
}

export function registerPortfolioHandlers() {
  // -------- Positions --------
  ipcMain.handle('portfolio:list', async (_e, token: string) => {
    const userId = auth(token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const db = getDb();
    const items = db
      .prepare('SELECT * FROM positions WHERE user_id = ? ORDER BY opened_at DESC')
      .all(userId);
    return { ok: true, data: items };
  });

  ipcMain.handle('portfolio:add', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const { symbol, name, kind, quantity, avgPrice, notes } = payload.position;
    if (!symbol || !kind || !quantity || !avgPrice) {
      return { ok: false, error: 'Champs requis.' };
    }
    const db = getDb();
    const r = db
      .prepare(
        `INSERT INTO positions (user_id, symbol, name, kind, quantity, avg_price, notes, opened_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(userId, symbol, name || symbol, kind, quantity, avgPrice, notes || null, Date.now());
    const created = db.prepare('SELECT * FROM positions WHERE id = ?').get(r.lastInsertRowid);
    return { ok: true, data: created };
  });

  ipcMain.handle('portfolio:update', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const { id, quantity, avgPrice, notes } = payload.position;
    const db = getDb();
    db.prepare(
      `UPDATE positions SET quantity = COALESCE(?, quantity),
                            avg_price = COALESCE(?, avg_price),
                            notes = COALESCE(?, notes)
       WHERE id = ? AND user_id = ?`
    ).run(quantity, avgPrice, notes, id, userId);
    return { ok: true };
  });

  ipcMain.handle('portfolio:remove', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const db = getDb();
    db.prepare('DELETE FROM positions WHERE id = ? AND user_id = ?').run(payload.id, userId);
    return { ok: true };
  });

  // -------- Watchlist --------
  ipcMain.handle('watchlist:list', async (_e, token: string) => {
    const userId = auth(token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const db = getDb();
    const items = db
      .prepare('SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC')
      .all(userId);
    return { ok: true, data: items };
  });

  ipcMain.handle('watchlist:add', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const { symbol, name, kind } = payload.asset;
    const db = getDb();
    try {
      const r = db
        .prepare(
          `INSERT INTO watchlist (user_id, symbol, name, kind, added_at)
           VALUES (?, ?, ?, ?, ?)`
        )
        .run(userId, symbol, name || symbol, kind, Date.now());
      const created = db.prepare('SELECT * FROM watchlist WHERE id = ?').get(r.lastInsertRowid);
      return { ok: true, data: created };
    } catch (e: any) {
      return { ok: false, error: 'Deja dans la watchlist.' };
    }
  });

  ipcMain.handle('watchlist:remove', async (_e, payload: any) => {
    const userId = auth(payload?.token);
    if (!userId) return { ok: false, error: 'Non authentifie.' };
    const db = getDb();
    db.prepare('DELETE FROM watchlist WHERE id = ? AND user_id = ?').run(payload.id, userId);
    return { ok: true };
  });
}
