import { ipcMain } from 'electron';
import axios from 'axios';
import { env } from './env';

const CG = 'https://api.coingecko.com/api/v3';
const BINANCE = 'https://api.binance.com/api/v3';
const FEAR_GREED = 'https://api.alternative.me/fng/?limit=30';

// Cache simple en memoire pour limiter les appels (rate limits gratuits)
const cache = new Map<string, { at: number; ttl: number; value: any }>();
function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return Promise.resolve(hit.value as T);
  return loader().then((value) => {
    cache.set(key, { at: Date.now(), ttl: ttlMs, value });
    return value;
  });
}

async function cgGet(path: string, params: any = {}) {
  const headers: any = { Accept: 'application/json' };
  const demoKey = env('COINGECKO_DEMO_KEY');
  if (demoKey) headers['x-cg-demo-api-key'] = demoKey;
  const { data } = await axios.get(`${CG}${path}`, { params, headers, timeout: 15000 });
  return data;
}

export function registerMarketHandlers() {
  // -------- Top crypto --------
  ipcMain.handle('markets:crypto-top', async (_e, limit = 100) =>
    cached(`crypto-top-${limit}`, 60_000, async () => {
      try {
        const data = await cgGet('/coins/markets', {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: true,
          price_change_percentage: '1h,24h,7d',
        });
        return { ok: true, data };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    })
  );

  // -------- Historique crypto --------
  ipcMain.handle('markets:crypto-history', async (_e, { id, days }) =>
    cached(`crypto-hist-${id}-${days}`, 5 * 60_000, async () => {
      try {
        const data = await cgGet(`/coins/${id}/market_chart`, {
          vs_currency: 'usd',
          days,
        });
        return { ok: true, data };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    })
  );

  // -------- Global crypto market --------
  ipcMain.handle('markets:global-crypto', async () =>
    cached('global-crypto', 60_000, async () => {
      try {
        const data = await cgGet('/global');
        return { ok: true, data };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    })
  );

  // -------- Fear & Greed Index --------
  ipcMain.handle('markets:fear-greed', async () =>
    cached('fng', 5 * 60_000, async () => {
      try {
        const { data } = await axios.get(FEAR_GREED, { timeout: 10000 });
        return { ok: true, data };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    })
  );

  // -------- Actions: quote via Yahoo Finance (non officiel mais gratuit) --------
  ipcMain.handle('markets:stock-quote', async (_e, symbol: string) =>
    cached(`stock-${symbol}`, 30_000, async () => {
      try {
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
        const { data } = await axios.get(url, {
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0 TradingPro/1.0' },
        });
        return { ok: true, data: data?.quoteResponse?.result?.[0] || null };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    })
  );

  // -------- Actions: historique --------
  ipcMain.handle('markets:stock-history', async (_e, { symbol, range }) =>
    cached(`stock-hist-${symbol}-${range}`, 5 * 60_000, async () => {
      try {
        const interval = range === '1d' ? '5m' : range === '5d' ? '30m' : '1d';
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
          symbol
        )}?range=${range}&interval=${interval}`;
        const { data } = await axios.get(url, {
          timeout: 12000,
          headers: { 'User-Agent': 'Mozilla/5.0 TradingPro/1.0' },
        });
        return { ok: true, data: data?.chart?.result?.[0] || null };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    })
  );

  // -------- News (CryptoCompare gratuit sans cle) --------
  ipcMain.handle('markets:news', async (_e, query: string) =>
    cached(`news-${query || 'all'}`, 5 * 60_000, async () => {
      try {
        const url = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';
        const { data } = await axios.get(url, { timeout: 12000 });
        let items = data?.Data || [];
        if (query) {
          const q = query.toLowerCase();
          items = items.filter((n: any) =>
            (n.title + ' ' + n.body).toLowerCase().includes(q)
          );
        }
        return { ok: true, data: items.slice(0, 30) };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    })
  );

  // -------- Prevision simple (moyenne mobile + lineaire) --------
  ipcMain.handle('markets:forecast', async (_e, { symbol, kind }) => {
    try {
      let series: number[] = [];
      if (kind === 'crypto') {
        const data = await cgGet(`/coins/${symbol}/market_chart`, {
          vs_currency: 'usd',
          days: 60,
        });
        series = (data?.prices || []).map((p: any) => p[1]);
      } else {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
          symbol
        )}?range=3mo&interval=1d`;
        const { data } = await axios.get(url, {
          timeout: 12000,
          headers: { 'User-Agent': 'Mozilla/5.0 TradingPro/1.0' },
        });
        series = (data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || []).filter(
          (x: any) => typeof x === 'number'
        );
      }
      if (series.length < 10) return { ok: false, error: 'Donnees insuffisantes.' };

      const forecast = computeForecast(series, 14);
      return { ok: true, data: forecast };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  });
}

/**
 * Calcule une prevision didactique a partir de la regression lineaire de la
 * tendance sur les N derniers points, combinee a la volatilite recente
 * (ecart-type des rendements log). NE CONSTITUE PAS UN CONSEIL FINANCIER.
 */
function computeForecast(series: number[], horizon = 14) {
  const n = series.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = series.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (series[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den ? num / den : 0;
  const intercept = meanY - slope * meanX;

  // Volatilite des log-rendements
  const rets: number[] = [];
  for (let i = 1; i < n; i++) {
    if (series[i - 1] > 0) rets.push(Math.log(series[i] / series[i - 1]));
  }
  const muR = rets.reduce((a, b) => a + b, 0) / (rets.length || 1);
  const varR =
    rets.reduce((a, b) => a + (b - muR) ** 2, 0) / Math.max(1, rets.length - 1);
  const sigma = Math.sqrt(varR);

  const last = series[n - 1];
  const points = [] as { day: number; mid: number; lower: number; upper: number }[];
  for (let i = 1; i <= horizon; i++) {
    const x = n - 1 + i;
    const trend = intercept + slope * x;
    // Drift autour de la valeur courante + tendance
    const driftedMid = last + (trend - last) * (i / horizon);
    const band = last * sigma * Math.sqrt(i) * 1.96;
    points.push({
      day: i,
      mid: driftedMid,
      lower: driftedMid - band,
      upper: driftedMid + band,
    });
  }

  // Determinations heuristiques (educatives, non financieres)
  const change = (points.at(-1)!.mid - last) / last;
  let bias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (change > 0.03) bias = 'bullish';
  if (change < -0.03) bias = 'bearish';

  // RSI simplifie
  const period = 14;
  let gains = 0,
    losses = 0;
  for (let i = Math.max(1, n - period); i < n; i++) {
    const d = series[i] - series[i - 1];
    if (d >= 0) gains += d;
    else losses -= d;
  }
  const rs = losses === 0 ? 100 : gains / losses;
  const rsi = 100 - 100 / (1 + rs);

  return {
    horizonDays: horizon,
    expectedChangePct: change * 100,
    bias,
    rsi,
    volatility: sigma,
    points,
    last,
    disclaimer:
      "Cette projection est purement statistique (regression + volatilite). Ce n'est PAS un conseil financier.",
  };
}
