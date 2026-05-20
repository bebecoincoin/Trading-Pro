import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PriceChart from '@/components/PriceChart';
import { fmtCompact, fmtCurrency, fmtPct, pctColor } from '@/lib/format';
import { Sparkles, Info } from 'lucide-react';
import clsx from 'clsx';

const RANGES = [
  { id: 1, label: '24h' },
  { id: 7, label: '7j' },
  { id: 30, label: '30j' },
  { id: 90, label: '90j' },
  { id: 365, label: '1a' },
];

export default function Asset() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const [days, setDays] = useState(30);
  const [history, setHistory] = useState<{ time: number; value: number }[]>([]);
  const [info, setInfo] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      if (kind === 'crypto') {
        const r = await window.tradingPro.markets.cryptoHistory(id, days);
        if (r?.ok) {
          setHistory((r.data?.prices || []).map((p: any) => ({ time: p[0], value: p[1] })));
        }
        const t = await window.tradingPro.markets.cryptoTop(250);
        if (t?.ok) setInfo(t.data.find((c: any) => c.id === id));
      } else {
        const range =
          days <= 1 ? '1d' : days <= 7 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : '1y';
        const r = await window.tradingPro.markets.stockHistory(id, range);
        if (r?.ok && r.data) {
          const ts: number[] = r.data.timestamp || [];
          const closes: number[] = r.data.indicators?.quote?.[0]?.close || [];
          const pts = ts
            .map((t, i) => ({ time: t * 1000, value: closes[i] }))
            .filter((p) => p.value != null);
          setHistory(pts);
        }
        const q = await window.tradingPro.markets.stockQuote(id);
        if (q?.ok) setInfo(q.data);
      }
    })();
  }, [kind, id, days]);

  const doForecast = async () => {
    if (!id) return;
    setForecast(null);
    const r = await window.tradingPro.markets.forecast(id, (kind as any) || 'crypto');
    if (r?.ok) setForecast(r.data);
  };

  if (!info) return <div className="text-text-muted">Chargement…</div>;

  const isCrypto = kind === 'crypto';
  const name = isCrypto ? info.name : info.shortName || info.longName || id;
  const symbol = isCrypto ? info.symbol : info.symbol;
  const price = isCrypto ? info.current_price : info.regularMarketPrice;
  const change24 = isCrypto
    ? info.price_change_percentage_24h
    : info.regularMarketChangePercent;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isCrypto && info.image && (
            <img src={info.image} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <div className="text-xs uppercase tracking-wider text-text-dim">
              {isCrypto ? 'Crypto' : 'Action'} · {(symbol || '').toUpperCase()}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">{name}</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold font-mono">{fmtCurrency(price)}</div>
          <div className={clsx('text-sm font-semibold', pctColor(change24))}>
            {fmtPct(change24)} 24h
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-1 mb-3">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setDays(r.id)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-md font-semibold',
                days === r.id
                  ? 'bg-accent text-bg'
                  : 'bg-bg-soft text-text-muted hover:text-text'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {history.length > 0 ? (
          <PriceChart data={history} height={420} />
        ) : (
          <div className="h-[420px] grid place-items-center text-text-muted">Chargement…</div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="font-bold mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-accent" /> Prevision statistique (14j)
          </div>
          {!forecast && (
            <div className="text-text-muted text-sm">
              Genere une projection didactique basee sur la regression lineaire des 60 derniers
              jours, la volatilite et le RSI. Ce n'est PAS un conseil financier.
              <div className="mt-3">
                <button onClick={doForecast} className="btn-primary">
                  Calculer la prevision
                </button>
              </div>
            </div>
          )}
          {forecast && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Biais" value={forecast.bias} accent={forecast.bias === 'bullish' ? 'text-accent-green' : forecast.bias === 'bearish' ? 'text-accent-red' : 'text-text'} />
                <Stat
                  label="Variation attendue"
                  value={fmtPct(forecast.expectedChangePct)}
                  accent={pctColor(forecast.expectedChangePct)}
                />
                <Stat label="RSI (14)" value={forecast.rsi.toFixed(1)} />
              </div>
              <div className="card p-3 bg-bg-soft/40 border-bg-border">
                <div className="text-xs text-text-dim mb-2">
                  Bornes a 95% (intervalle de confiance)
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-dim">
                      <th className="text-left py-1">Jour</th>
                      <th className="text-right py-1">Bas</th>
                      <th className="text-right py-1">Median</th>
                      <th className="text-right py-1">Haut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.points
                      .filter((_: any, i: number) => i % 2 === 0)
                      .map((p: any) => (
                        <tr key={p.day}>
                          <td className="py-0.5">J+{p.day}</td>
                          <td className="py-0.5 text-right font-mono text-accent-red/80">
                            {fmtCurrency(p.lower)}
                          </td>
                          <td className="py-0.5 text-right font-mono">{fmtCurrency(p.mid)}</td>
                          <td className="py-0.5 text-right font-mono text-accent-green/80">
                            {fmtCurrency(p.upper)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[11px] text-accent-gold/90 flex items-start gap-1.5">
                <Info size={12} className="mt-0.5" />
                {forecast.disclaimer}
              </div>
            </div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <div className="font-bold mb-1">Donnees cles</div>
          {isCrypto ? (
            <>
              <Row label="Rank" value={`#${info.market_cap_rank}`} />
              <Row label="Market Cap" value={fmtCompact(info.market_cap)} />
              <Row label="Volume 24h" value={fmtCompact(info.total_volume)} />
              <Row label="ATH" value={fmtCurrency(info.ath)} />
              <Row label="ATL" value={fmtCurrency(info.atl)} />
              <Row
                label="Supply"
                value={`${fmtCompact(info.circulating_supply)} / ${fmtCompact(
                  info.total_supply ?? info.max_supply ?? 0
                )}`}
              />
              <Row label="Variation 7j" value={fmtPct(info.price_change_percentage_7d_in_currency)} />
              <Row label="Variation 30j" value={fmtPct(info.price_change_percentage_30d_in_currency)} />
            </>
          ) : (
            <>
              <Row label="Cours d'ouverture" value={fmtCurrency(info.regularMarketOpen)} />
              <Row label="Plus haut jour" value={fmtCurrency(info.regularMarketDayHigh)} />
              <Row label="Plus bas jour" value={fmtCurrency(info.regularMarketDayLow)} />
              <Row label="Volume" value={fmtCompact(info.regularMarketVolume)} />
              <Row label="Capitalisation" value={fmtCompact(info.marketCap)} />
              <Row label="PER" value={info.trailingPE ? info.trailingPE.toFixed(2) : '—'} />
              <Row label="52w plus haut" value={fmtCurrency(info.fiftyTwoWeekHigh)} />
              <Row label="52w plus bas" value={fmtCurrency(info.fiftyTwoWeekLow)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold font-mono">{value}</span>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: any; accent?: string }) {
  return (
    <div className="card p-3 bg-bg-soft/40 border-bg-border">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className={clsx('text-lg font-extrabold capitalize', accent)}>{value}</div>
    </div>
  );
}
