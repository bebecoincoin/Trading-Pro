import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Globe2, Sparkles, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import Sparkline from '@/components/Sparkline';
import PriceChart from '@/components/PriceChart';
import { fmtCompact, fmtCurrency, fmtPct, pctColor } from '@/lib/format';
import clsx from 'clsx';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d: { price: number[] };
}

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [global, setGlobal] = useState<any>(null);
  const [fng, setFng] = useState<any>(null);
  const [btcHistory, setBtcHistory] = useState<{ time: number; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const r = await window.tradingPro.markets.cryptoTop(50);
      if (r?.ok) setCoins(r.data);
      const g = await window.tradingPro.markets.globalCrypto();
      if (g?.ok) setGlobal(g.data?.data);
      const f = await window.tradingPro.markets.fearGreed();
      if (f?.ok) setFng(f.data?.data?.[0]);
      const h = await window.tradingPro.markets.cryptoHistory('bitcoin', 30);
      if (h?.ok) {
        setBtcHistory(
          (h.data?.prices || []).map((p: any) => ({ time: p[0], value: p[1] }))
        );
      }
    })();
  }, []);

  const gainers = [...coins]
    .filter((c) => c.price_change_percentage_24h != null)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);
  const losers = [...coins]
    .filter((c) => c.price_change_percentage_24h != null)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-text-muted text-sm">Vue d'ensemble en temps reel.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/app/simulator"
            className="btn-soft border-accent-gold/30 bg-gradient-to-r from-accent-gold/10 to-accent-violet/10 text-accent-gold hover:border-accent-gold/60"
          >
            <Zap size={15} /> Simulateur 1M $
          </Link>
          <Link to="/app/markets" className="btn-primary">
            Explorer les marches <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Globe2 size={18} />}
          label="Market Cap Crypto"
          value={global ? fmtCurrency(global.total_market_cap?.usd) : '—'}
          sub={
            global
              ? `${fmtPct(global.market_cap_change_percentage_24h_usd)} (24h)`
              : ''
          }
          subPositive={(global?.market_cap_change_percentage_24h_usd ?? 0) >= 0}
        />
        <Kpi
          icon={<Sparkles size={18} />}
          label="Volume 24h"
          value={global ? fmtCurrency(global.total_volume?.usd) : '—'}
          sub={global ? `${global.active_cryptocurrencies ?? 0} actifs suivis` : ''}
        />
        <Kpi
          icon={<Flame size={18} />}
          label="Dominance BTC"
          value={global ? `${(global.market_cap_percentage?.btc ?? 0).toFixed(2)}%` : '—'}
          sub={global ? `ETH ${(global.market_cap_percentage?.eth ?? 0).toFixed(2)}%` : ''}
        />
        <Kpi
          icon={<Sparkles size={18} />}
          label="Fear & Greed"
          value={fng ? `${fng.value} / 100` : '—'}
          sub={fng?.value_classification || ''}
          accent={
            fng?.value_classification?.includes('Greed')
              ? 'text-accent-green'
              : fng?.value_classification?.includes('Fear')
                ? 'text-accent-red'
                : ''
          }
        />
      </div>

      {/* BTC chart + side */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-text-dim">Reference</div>
              <div className="font-bold">Bitcoin / USD · 30j</div>
            </div>
            <Link
              to="/app/markets/crypto/bitcoin"
              className="text-sm text-accent hover:underline"
            >
              Detail →
            </Link>
          </div>
          {btcHistory.length ? (
            <PriceChart data={btcHistory} height={300} />
          ) : (
            <div className="h-[300px] grid place-items-center text-text-muted">
              Chargement…
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold flex items-center gap-2">
                <TrendingUp size={16} className="text-accent-green" /> Top gagnants 24h
              </div>
            </div>
            <ul className="space-y-2.5">
              {gainers.map((c) => (
                <CoinRow key={c.id} c={c} />
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold flex items-center gap-2">
                <TrendingDown size={16} className="text-accent-red" /> Top perdants 24h
              </div>
            </div>
            <ul className="space-y-2.5">
              {losers.map((c) => (
                <CoinRow key={c.id} c={c} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Liste top */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <div className="font-bold">Top capitalisations</div>
          <Link to="/app/markets" className="text-sm text-accent hover:underline">
            Tout voir
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-text-dim">
            <tr>
              <th className="text-left px-5 py-2">#</th>
              <th className="text-left px-5 py-2">Actif</th>
              <th className="text-right px-5 py-2">Prix</th>
              <th className="text-right px-5 py-2">24h</th>
              <th className="text-right px-5 py-2">7j</th>
              <th className="text-right px-5 py-2">Mkt Cap</th>
              <th className="text-right px-5 py-2 pr-6">Volume</th>
              <th className="text-right px-5 py-2 pr-6">7j</th>
            </tr>
          </thead>
          <tbody>
            {coins.slice(0, 12).map((c, i) => (
              <tr
                key={c.id}
                className="border-t border-bg-border hover:bg-bg-soft/50 transition"
              >
                <td className="px-5 py-3 text-text-dim">{i + 1}</td>
                <td className="px-5 py-3">
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
                <td className="px-5 py-3 text-right font-mono">{fmtCurrency(c.current_price)}</td>
                <td
                  className={clsx(
                    'px-5 py-3 text-right font-mono font-semibold',
                    pctColor(c.price_change_percentage_24h)
                  )}
                >
                  {fmtPct(c.price_change_percentage_24h)}
                </td>
                <td
                  className={clsx(
                    'px-5 py-3 text-right font-mono font-semibold',
                    pctColor(c.price_change_percentage_7d_in_currency)
                  )}
                >
                  {fmtPct(c.price_change_percentage_7d_in_currency)}
                </td>
                <td className="px-5 py-3 text-right text-text-muted">
                  {fmtCompact(c.market_cap)}
                </td>
                <td className="px-5 py-3 text-right text-text-muted pr-6">
                  {fmtCompact(c.total_volume)}
                </td>
                <td className="px-5 py-3 text-right pr-6">
                  <div className="inline-block">
                    <Sparkline
                      data={c.sparkline_in_7d?.price ?? []}
                      positive={c.price_change_percentage_7d_in_currency >= 0}
                      width={110}
                      height={32}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoinRow({ c }: { c: Coin }) {
  return (
    <li>
      <Link
        to={`/app/markets/crypto/${c.id}`}
        className="flex items-center gap-2.5 group"
      >
        <img src={c.image} className="w-6 h-6 rounded-full" alt="" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate group-hover:text-accent transition">
            {c.name}
          </div>
          <div className="text-[11px] text-text-dim uppercase">{c.symbol}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono">{fmtCurrency(c.current_price)}</div>
          <div
            className={clsx(
              'text-[11px] font-semibold',
              pctColor(c.price_change_percentage_24h)
            )}
          >
            {fmtPct(c.price_change_percentage_24h)}
          </div>
        </div>
      </Link>
    </li>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  subPositive,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subPositive?: boolean;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between text-text-muted">
        <div className="text-xs uppercase tracking-wider">{label}</div>
        <div className="text-accent">{icon}</div>
      </div>
      <div className={clsx('mt-2 text-2xl font-extrabold tracking-tight', accent)}>
        {value}
      </div>
      {sub && (
        <div
          className={clsx(
            'text-xs mt-1',
            subPositive === true
              ? 'text-accent-green'
              : subPositive === false
                ? 'text-accent-red'
                : 'text-text-muted'
          )}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
