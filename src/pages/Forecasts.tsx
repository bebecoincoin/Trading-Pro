import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { fmtCurrency, fmtPct, pctColor } from '@/lib/format';
import clsx from 'clsx';

const SUGGESTIONS = [
  { id: 'bitcoin', label: 'Bitcoin', kind: 'crypto' as const },
  { id: 'ethereum', label: 'Ethereum', kind: 'crypto' as const },
  { id: 'solana', label: 'Solana', kind: 'crypto' as const },
  { id: 'AAPL', label: 'Apple', kind: 'stock' as const },
  { id: 'NVDA', label: 'NVIDIA', kind: 'stock' as const },
  { id: 'TSLA', label: 'Tesla', kind: 'stock' as const },
];

export default function Forecasts() {
  const [symbol, setSymbol] = useState('bitcoin');
  const [kind, setKind] = useState<'crypto' | 'stock'>('crypto');
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const run = async (s?: string, k?: 'crypto' | 'stock') => {
    setBusy(true);
    setData(null);
    const r = await window.tradingPro.markets.forecast(s ?? symbol, k ?? kind);
    setBusy(false);
    if (r?.ok) setData(r.data);
    else setData({ error: r?.error || 'Erreur' });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Sparkles size={22} className="text-accent" /> Previsions
        </h1>
        <p className="text-text-muted text-sm">
          Projection statistique a 14 jours basee sur regression + volatilite + RSI.
          <span className="text-accent-gold ml-1">Pas un conseil financier.</span>
        </p>
      </div>

      <div className="card p-5">
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
            >
              <option value="crypto">Crypto (id CoinGecko: bitcoin, ethereum…)</option>
              <option value="stock">Action (ticker: AAPL, MSFT…)</option>
            </select>
          </div>
          <div>
            <label className="label">Symbole / id</label>
            <input
              className="input"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>
          <button onClick={() => run()} className="btn-primary py-3" disabled={busy || !symbol}>
            {busy && <Loader2 className="animate-spin" size={16} />}
            Generer
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSymbol(s.id);
                setKind(s.kind);
                run(s.id, s.kind);
              }}
              className="btn-soft text-xs py-1.5"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {data && !data.error && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Stat label="Biais" value={data.bias} accent={data.bias === 'bullish' ? 'text-accent-green' : data.bias === 'bearish' ? 'text-accent-red' : 'text-text'} />
          <Stat
            label="Variation attendue (14j)"
            value={fmtPct(data.expectedChangePct)}
            accent={pctColor(data.expectedChangePct)}
          />
          <Stat
            label="RSI"
            value={data.rsi.toFixed(1)}
            accent={data.rsi > 70 ? 'text-accent-red' : data.rsi < 30 ? 'text-accent-green' : 'text-text'}
          />
        </div>
      )}

      {data && data.points && (
        <div className="card p-5">
          <div className="text-sm text-text-muted mb-3">
            Projection point par point (95% CI). Dernier prix observe :{' '}
            <strong className="text-text">{fmtCurrency(data.last)}</strong>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-text-dim">
              <tr>
                <th className="text-left py-2">Jour</th>
                <th className="text-right py-2">Borne basse</th>
                <th className="text-right py-2">Median</th>
                <th className="text-right py-2">Borne haute</th>
                <th className="text-right py-2">Delta</th>
              </tr>
            </thead>
            <tbody>
              {data.points.map((p: any) => {
                const delta = ((p.mid - data.last) / data.last) * 100;
                return (
                  <tr key={p.day} className="border-t border-bg-border">
                    <td className="py-2">J+{p.day}</td>
                    <td className="py-2 text-right font-mono text-accent-red/80">
                      {fmtCurrency(p.lower)}
                    </td>
                    <td className="py-2 text-right font-mono">{fmtCurrency(p.mid)}</td>
                    <td className="py-2 text-right font-mono text-accent-green/80">
                      {fmtCurrency(p.upper)}
                    </td>
                    <td
                      className={clsx(
                        'py-2 text-right font-mono font-semibold',
                        pctColor(delta)
                      )}
                    >
                      {fmtPct(delta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-xs text-accent-gold/90 mt-4">{data.disclaimer}</div>
        </div>
      )}

      {data?.error && (
        <div className="card p-4 text-sm text-accent-red border-accent-red/30">
          {data.error}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: any; accent?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-text-dim">{label}</div>
      <div className={clsx('mt-1 text-2xl font-extrabold tracking-tight capitalize', accent)}>
        {value}
      </div>
    </div>
  );
}
