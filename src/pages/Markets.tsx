import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import Sparkline from '@/components/Sparkline';
import { fmtCompact, fmtCurrency, fmtPct, pctColor } from '@/lib/format';
import { useAuth } from '@/lib/store/auth';
import clsx from 'clsx';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: { price: number[] };
}

const TABS = [
  { id: 'crypto', label: 'Crypto' },
  { id: 'stocks', label: 'Actions' },
  { id: 'watchlist', label: 'Watchlist' },
];

export default function Markets() {
  const [tab, setTab] = useState('crypto');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [q, setQ] = useState('');
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const token = useAuth((s) => s.token);

  useEffect(() => {
    (async () => {
      const r = await window.tradingPro.markets.cryptoTop(100);
      if (r?.ok) setCoins(r.data);
      if (token) {
        const w = await window.tradingPro.portfolio.watchlist.list(token);
        if (w?.ok) setWatchlist(w.data);
      }
    })();
  }, [token]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return coins.filter(
      (c) =>
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.symbol.toLowerCase().includes(term)
    );
  }, [coins, q]);

  const inWatchlist = (id: string) =>
    watchlist.some((w) => w.symbol === id && w.kind === 'crypto');

  const toggleWatch = async (c: Coin) => {
    if (!token) return;
    const existing = watchlist.find((w) => w.symbol === c.id && w.kind === 'crypto');
    if (existing) {
      await window.tradingPro.portfolio.watchlist.remove(token, existing.id);
      setWatchlist(watchlist.filter((w) => w.id !== existing.id));
    } else {
      const r = await window.tradingPro.portfolio.watchlist.add(token, {
        symbol: c.id,
        name: c.name,
        kind: 'crypto',
      });
      if (r?.ok) setWatchlist([r.data, ...watchlist]);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Marches</h1>
          <p className="text-text-muted text-sm">Crypto, actions et watchlist.</p>
        </div>
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            className="input pl-9"
            placeholder="Rechercher…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-bg-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 transition -mb-px',
              tab === t.id
                ? 'border-accent text-text'
                : 'border-transparent text-text-muted hover:text-text'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'crypto' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-text-dim">
              <tr>
                <th className="text-left px-4 py-3 w-6"></th>
                <th className="text-left px-3 py-3 w-8">#</th>
                <th className="text-left px-3 py-3">Actif</th>
                <th className="text-right px-3 py-3">Prix</th>
                <th className="text-right px-3 py-3">1h</th>
                <th className="text-right px-3 py-3">24h</th>
                <th className="text-right px-3 py-3">7j</th>
                <th className="text-right px-3 py-3">Mkt Cap</th>
                <th className="text-right px-3 py-3">Volume</th>
                <th className="text-right px-3 py-3 pr-5">7j chart</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-bg-border hover:bg-bg-soft/40 transition"
                >
                  <td className="px-4 py-3">
                    <button onClick={() => toggleWatch(c)}>
                      <Star
                        size={15}
                        className={clsx(
                          'transition',
                          inWatchlist(c.id)
                            ? 'fill-accent-gold text-accent-gold'
                            : 'text-text-dim hover:text-accent-gold'
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-3 text-text-dim">{c.market_cap_rank}</td>
                  <td className="px-3 py-3">
                    <Link
                      to={`/app/markets/crypto/${c.id}`}
                      className="flex items-center gap-2 group"
                    >
                      <img src={c.image} className="w-6 h-6 rounded-full" alt="" />
                      <div>
                        <div className="font-semibold group-hover:text-accent transition">
                          {c.name}
                        </div>
                        <div className="text-xs text-text-dim uppercase">{c.symbol}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-right font-mono">
                    {fmtCurrency(c.current_price)}
                  </td>
                  <td
                    className={clsx(
                      'px-3 py-3 text-right font-mono font-semibold',
                      pctColor(c.price_change_percentage_1h_in_currency)
                    )}
                  >
                    {fmtPct(c.price_change_percentage_1h_in_currency)}
                  </td>
                  <td
                    className={clsx(
                      'px-3 py-3 text-right font-mono font-semibold',
                      pctColor(c.price_change_percentage_24h)
                    )}
                  >
                    {fmtPct(c.price_change_percentage_24h)}
                  </td>
                  <td
                    className={clsx(
                      'px-3 py-3 text-right font-mono font-semibold',
                      pctColor(c.price_change_percentage_7d_in_currency)
                    )}
                  >
                    {fmtPct(c.price_change_percentage_7d_in_currency)}
                  </td>
                  <td className="px-3 py-3 text-right text-text-muted">
                    {fmtCompact(c.market_cap)}
                  </td>
                  <td className="px-3 py-3 text-right text-text-muted">
                    {fmtCompact(c.total_volume)}
                  </td>
                  <td className="px-3 py-3 text-right pr-5">
                    <Sparkline
                      data={c.sparkline_in_7d?.price ?? []}
                      positive={c.price_change_percentage_7d_in_currency >= 0}
                      width={120}
                      height={34}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'stocks' && <StocksView />}
      {tab === 'watchlist' && (
        <WatchlistView
          watchlist={watchlist}
          coins={coins}
          remove={async (id) => {
            if (!token) return;
            await window.tradingPro.portfolio.watchlist.remove(token, id);
            setWatchlist(watchlist.filter((w) => w.id !== id));
          }}
        />
      )}
    </div>
  );
}

function StocksView() {
  const tickers = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'AMD', 'NFLX', 'JPM', 'SPY', 'QQQ'];
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const results: any[] = [];
      for (const t of tickers) {
        const r = await window.tradingPro.markets.stockQuote(t);
        if (r?.ok && r.data) results.push(r.data);
      }
      setData(results);
    })();
  }, []);

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-text-dim">
          <tr>
            <th className="text-left px-5 py-3">Ticker</th>
            <th className="text-left px-3 py-3">Nom</th>
            <th className="text-right px-3 py-3">Prix</th>
            <th className="text-right px-3 py-3">Variation</th>
            <th className="text-right px-3 py-3">% jour</th>
            <th className="text-right px-3 py-3 pr-5">Volume</th>
          </tr>
        </thead>
        <tbody>
          {data.map((q) => (
            <tr
              key={q.symbol}
              className="border-t border-bg-border hover:bg-bg-soft/40 transition"
            >
              <td className="px-5 py-3">
                <Link
                  to={`/app/markets/stock/${q.symbol}`}
                  className="font-semibold hover:text-accent"
                >
                  {q.symbol}
                </Link>
              </td>
              <td className="px-3 py-3 text-text-muted">{q.shortName || q.longName}</td>
              <td className="px-3 py-3 text-right font-mono">
                {fmtCurrency(q.regularMarketPrice, q.currency || 'USD')}
              </td>
              <td
                className={clsx(
                  'px-3 py-3 text-right font-mono',
                  pctColor(q.regularMarketChange)
                )}
              >
                {q.regularMarketChange?.toFixed(2)}
              </td>
              <td
                className={clsx(
                  'px-3 py-3 text-right font-mono font-semibold',
                  pctColor(q.regularMarketChangePercent)
                )}
              >
                {fmtPct(q.regularMarketChangePercent)}
              </td>
              <td className="px-3 py-3 text-right text-text-muted pr-5">
                {fmtCompact(q.regularMarketVolume)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WatchlistView({
  watchlist,
  coins,
  remove,
}: {
  watchlist: any[];
  coins: Coin[];
  remove: (id: number) => void;
}) {
  if (!watchlist.length) {
    return (
      <div className="card p-8 text-center text-text-muted">
        Aucun actif suivi. Clique sur l'etoile dans la liste pour ajouter.
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-text-dim">
          <tr>
            <th className="text-left px-5 py-3">Actif</th>
            <th className="text-left px-3 py-3">Type</th>
            <th className="text-right px-3 py-3">Prix</th>
            <th className="text-right px-3 py-3">24h</th>
            <th className="text-right px-3 py-3 pr-5"></th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((w) => {
            const c = coins.find((x) => x.id === w.symbol);
            return (
              <tr key={w.id} className="border-t border-bg-border">
                <td className="px-5 py-3">
                  <Link
                    to={`/app/markets/${w.kind}/${w.symbol}`}
                    className="flex items-center gap-2 hover:text-accent"
                  >
                    {c?.image && <img src={c.image} className="w-5 h-5 rounded-full" />}
                    <span className="font-semibold">{w.name}</span>
                    <span className="text-xs uppercase text-text-dim">{w.symbol}</span>
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <span className="badge-violet">{w.kind}</span>
                </td>
                <td className="px-3 py-3 text-right font-mono">
                  {c ? fmtCurrency(c.current_price) : '—'}
                </td>
                <td
                  className={clsx(
                    'px-3 py-3 text-right font-mono font-semibold',
                    pctColor(c?.price_change_percentage_24h)
                  )}
                >
                  {c ? fmtPct(c.price_change_percentage_24h) : '—'}
                </td>
                <td className="px-3 py-3 text-right pr-5">
                  <button
                    onClick={() => remove(w.id)}
                    className="text-xs text-accent-red hover:underline"
                  >
                    retirer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
