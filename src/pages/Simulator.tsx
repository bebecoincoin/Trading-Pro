import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/lib/store/auth';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Briefcase,
  Loader2,
  RefreshCw,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { fmtCurrency, fmtDate, fmtPct, pctColor } from '@/lib/format';
import clsx from 'clsx';

interface PaperAccount {
  user_id: number;
  cash_balance: number;
  initial_balance: number;
  created_at: number;
  reset_count: number;
}

interface PaperPosition {
  id: number;
  symbol: string;
  name: string;
  kind: 'crypto' | 'stock';
  quantity: number;
  avg_price: number;
  created_at: number;
}

interface PaperTrade {
  id: number;
  symbol: string;
  name: string;
  kind: 'crypto' | 'stock';
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  fee: number;
  realized_pnl: number;
  created_at: number;
}

const QUICK_ASSETS: { symbol: string; name: string; kind: 'crypto' | 'stock' }[] = [
  { symbol: 'bitcoin', name: 'Bitcoin', kind: 'crypto' },
  { symbol: 'ethereum', name: 'Ethereum', kind: 'crypto' },
  { symbol: 'solana', name: 'Solana', kind: 'crypto' },
  { symbol: 'binancecoin', name: 'BNB', kind: 'crypto' },
  { symbol: 'cardano', name: 'Cardano', kind: 'crypto' },
  { symbol: 'AAPL', name: 'Apple', kind: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA', kind: 'stock' },
  { symbol: 'TSLA', name: 'Tesla', kind: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', kind: 'stock' },
  { symbol: 'AMZN', name: 'Amazon', kind: 'stock' },
];

export default function Simulator() {
  const token = useAuth((s) => s.token)!;
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [modal, setModal] = useState<{
    side: 'buy' | 'sell';
    symbol: string;
    name: string;
    kind: 'crypto' | 'stock';
    suggestedPrice?: number;
  } | null>(null);
  const [tab, setTab] = useState<'positions' | 'trades'>('positions');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    if (!token) return;
    const [a, p, t] = await Promise.all([
      window.tradingPro.paper.account(token),
      window.tradingPro.paper.positions(token),
      window.tradingPro.paper.trades(token, 100),
    ]);
    if (!aliveRef.current) return;
    if (a?.ok) setAccount(a.data);
    if (p?.ok) setPositions(p.data);
    if (t?.ok) setTrades(t.data);
    setLoading(false);
  }, [token]);

  // Refresh sur mount + sur retour de focus + tous les 30s
  useEffect(() => {
    aliveRef.current = true;
    setLoading(true);
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const i = setInterval(load, 30_000);
    return () => {
      aliveRef.current = false;
      clearInterval(i);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Refresh prices for positions
  useEffect(() => {
    let cancel = false;
    const refresh = async () => {
      const updates: Record<string, number> = {};
      for (const p of positions) {
        const r = await window.tradingPro.paper.quote(p.symbol, p.kind as any);
        if (r?.ok) updates[`${p.kind}:${p.symbol}`] = r.price;
      }
      if (!cancel) setLivePrices((prev) => ({ ...prev, ...updates }));
    };
    if (positions.length) refresh();
    const i = setInterval(refresh, 30_000);
    return () => {
      cancel = true;
      clearInterval(i);
    };
  }, [positions]);

  const totals = useMemo(() => {
    if (!account)
      return { cash: 0, equity: 0, total: 0, pnl: 0, pnlPct: 0, posValue: 0 };
    const cash = account.cash_balance;
    let posValue = 0;
    for (const p of positions) {
      const px = livePrices[`${p.kind}:${p.symbol}`] ?? p.avg_price;
      posValue += px * p.quantity;
    }
    const total = cash + posValue;
    const pnl = total - account.initial_balance;
    const pnlPct = account.initial_balance ? (pnl / account.initial_balance) * 100 : 0;
    return { cash, equity: posValue, total, pnl, pnlPct, posValue };
  }, [account, positions, livePrices]);

  const [showReset, setShowReset] = useState(false);

  const performReset = async (balance?: number) => {
    await window.tradingPro.paper.reset(token, balance);
    setShowReset(false);
    await load();
    setNotice('Simulateur reinitialise.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Zap size={22} className="text-accent-gold" /> Simulateur 1M $
            </h1>
            <span className="badge-violet">PAPER MONEY</span>
            {loading && (
              <span className="text-xs text-text-dim flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" /> Sync…
              </span>
            )}
          </div>
          <p className="text-text-muted text-sm">
            Trade avec 1 000 000 $ virtuels aux prix marche reels. Aucun argent reel
            implique.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost">
            <RefreshCw size={14} /> Rafraichir
          </button>
          <button onClick={() => setShowReset(true)} className="btn-soft text-accent-red border-accent-red/30">
            Reinitialiser
          </button>
        </div>
      </div>

      {notice && (
        <div className="card p-3 border-accent-green/40 bg-accent-green/10 text-sm text-accent-green flex items-center gap-2">
          <TrendingUp size={14} /> {notice}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          icon={<Wallet size={18} />}
          label="Valeur totale"
          value={fmtCurrency(totals.total)}
          sub={
            account
              ? `Initial : ${fmtCurrency(account.initial_balance)}${
                  account.reset_count ? ` · ${account.reset_count} reset` : ''
                }`
              : ''
          }
        />
        <Kpi
          icon={<Banknote size={18} />}
          label="Cash disponible"
          value={fmtCurrency(totals.cash)}
          sub="Pret a investir"
          accent="text-accent-green"
        />
        <Kpi
          icon={<Briefcase size={18} />}
          label="Positions"
          value={fmtCurrency(totals.equity)}
          sub={`${positions.length} actif${positions.length > 1 ? 's' : ''}`}
        />
        <Kpi
          icon={<TrendingUp size={18} />}
          label="P&L total"
          value={fmtCurrency(totals.pnl)}
          sub={fmtPct(totals.pnlPct)}
          accent={pctColor(totals.pnl)}
        />
      </div>

      {/* Quick trade */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold">Achat rapide</div>
            <div className="text-xs text-text-muted">
              Selectionne un actif puis defini la quantite (frais simules : 0.1%)
            </div>
          </div>
          <button
            onClick={() =>
              setModal({ side: 'buy', symbol: '', name: '', kind: 'crypto' })
            }
            className="btn-primary"
          >
            + Ordre personnalise
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ASSETS.map((a) => (
            <button
              key={a.kind + a.symbol}
              onClick={() => setModal({ side: 'buy', ...a })}
              className="btn-soft text-xs"
            >
              + {a.name}
              <span className="text-text-dim font-mono">
                · {a.symbol.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-bg-border">
        <button
          onClick={() => setTab('positions')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
            tab === 'positions'
              ? 'border-accent text-text'
              : 'border-transparent text-text-muted hover:text-text'
          )}
        >
          Positions ouvertes ({positions.length})
        </button>
        <button
          onClick={() => setTab('trades')}
          className={clsx(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
            tab === 'trades'
              ? 'border-accent text-text'
              : 'border-transparent text-text-muted hover:text-text'
          )}
        >
          Historique ({trades.length})
        </button>
      </div>

      {tab === 'positions' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-text-dim">
              <tr>
                <th className="text-left px-5 py-3">Actif</th>
                <th className="text-right px-3 py-3">Type</th>
                <th className="text-right px-3 py-3">Qte</th>
                <th className="text-right px-3 py-3">Prix moyen</th>
                <th className="text-right px-3 py-3">Prix actuel</th>
                <th className="text-right px-3 py-3">Valeur</th>
                <th className="text-right px-3 py-3">P&L latent</th>
                <th className="text-right px-3 py-3 pr-5"></th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-text-muted">
                    Aucune position. Achete un actif pour commencer.
                  </td>
                </tr>
              ) : (
                positions.map((p) => {
                  const px = livePrices[`${p.kind}:${p.symbol}`] ?? p.avg_price;
                  const value = px * p.quantity;
                  const cost = p.avg_price * p.quantity;
                  const pnl = value - cost;
                  const pnlPct = cost ? (pnl / cost) * 100 : 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-bg-border hover:bg-bg-soft/40 transition"
                    >
                      <td className="px-5 py-3">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-text-dim uppercase font-mono">
                          {p.symbol}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="badge-violet">{p.kind}</span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono">{p.quantity}</td>
                      <td className="px-3 py-3 text-right font-mono">
                        {fmtCurrency(p.avg_price)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        {fmtCurrency(px)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold">
                        {fmtCurrency(value)}
                      </td>
                      <td
                        className={clsx(
                          'px-3 py-3 text-right font-mono font-semibold',
                          pctColor(pnl)
                        )}
                      >
                        {fmtCurrency(pnl)}
                        <div className={clsx('text-[11px]', pctColor(pnlPct))}>
                          {fmtPct(pnlPct)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right pr-5">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() =>
                              setModal({
                                side: 'buy',
                                symbol: p.symbol,
                                name: p.name,
                                kind: p.kind,
                                suggestedPrice: px,
                              })
                            }
                            className="text-xs px-2 py-1 rounded-md bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
                          >
                            Acheter
                          </button>
                          <button
                            onClick={() =>
                              setModal({
                                side: 'sell',
                                symbol: p.symbol,
                                name: p.name,
                                kind: p.kind,
                                suggestedPrice: px,
                              })
                            }
                            className="text-xs px-2 py-1 rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/20"
                          >
                            Vendre
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'trades' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-text-dim">
              <tr>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-3 py-3">Sens</th>
                <th className="text-left px-3 py-3">Actif</th>
                <th className="text-right px-3 py-3">Qte</th>
                <th className="text-right px-3 py-3">Prix</th>
                <th className="text-right px-3 py-3">Total</th>
                <th className="text-right px-3 py-3">Frais</th>
                <th className="text-right px-3 py-3 pr-5">P&L realise</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-text-muted">
                    Aucun ordre execute.
                  </td>
                </tr>
              ) : (
                trades.map((t) => (
                  <tr key={t.id} className="border-t border-bg-border">
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {fmtDate(t.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          t.side === 'buy'
                            ? 'badge-green flex items-center gap-1 w-fit'
                            : 'badge-red flex items-center gap-1 w-fit'
                        }
                      >
                        {t.side === 'buy' ? (
                          <ArrowDownRight size={11} />
                        ) : (
                          <ArrowUpRight size={11} />
                        )}
                        {t.side === 'buy' ? 'Achat' : 'Vente'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-text-dim uppercase font-mono">
                        {t.symbol}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono">{t.quantity}</td>
                    <td className="px-3 py-3 text-right font-mono">
                      {fmtCurrency(t.price)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono">
                      {fmtCurrency(t.total)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-text-dim">
                      {fmtCurrency(t.fee)}
                    </td>
                    <td
                      className={clsx(
                        'px-3 py-3 text-right font-mono font-semibold pr-5',
                        pctColor(t.realized_pnl)
                      )}
                    >
                      {t.side === 'sell' ? fmtCurrency(t.realized_pnl) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="card p-4 text-xs text-text-muted leading-relaxed">
        <strong className="text-accent">Regles du simulateur :</strong> solde de depart{' '}
        <strong>illimite</strong> (999 milliards $ par defaut), frais 0.1% par ordre
        (taux Binance taker), long only (pas de short). Les prix sont les{' '}
        <strong>vrais prix marche</strong> via CoinGecko et Yahoo Finance. Tu peux
        reset avec le solde de ton choix.
      </div>

      {showReset && <ResetModal onClose={() => setShowReset(false)} onConfirm={performReset} />}

      {modal && (
        <TradeModal
          {...modal}
          onClose={() => setModal(null)}
          onExecuted={async (msg) => {
            await load();
            showNotice(msg);
          }}
          token={token}
        />
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between text-text-muted">
        <div className="text-xs uppercase tracking-wider">{label}</div>
        <div className="text-accent">{icon}</div>
      </div>
      <div className={clsx('mt-2 text-2xl font-extrabold font-mono tracking-tight', accent)}>
        {value}
      </div>
      {sub && <div className="text-xs mt-1 text-text-muted">{sub}</div>}
    </div>
  );
}

function TradeModal({
  side,
  symbol: initialSymbol,
  name: initialName,
  kind: initialKind,
  suggestedPrice,
  token,
  onClose,
  onExecuted,
}: {
  side: 'buy' | 'sell';
  symbol: string;
  name: string;
  kind: 'crypto' | 'stock';
  suggestedPrice?: number;
  token: string;
  onClose: () => void;
  onExecuted: (msg: string) => void | Promise<void>;
}) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState(initialKind);
  const [quantity, setQuantity] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [price, setPrice] = useState<number | null>(suggestedPrice ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPrice = async () => {
    if (!symbol) return;
    setError(null);
    setBusy(true);
    const r = await window.tradingPro.paper.quote(symbol, kind);
    setBusy(false);
    if (r?.ok) setPrice(r.price);
    else setError(r?.error || 'Prix indisponible. Verifie le symbole.');
  };

  useEffect(() => {
    if (symbol && !suggestedPrice) fetchPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, kind]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const q = parseFloat(quantity);
    if (!symbol || !q || q <= 0) {
      setError('Symbole et quantite requis.');
      return;
    }
    setBusy(true);
    const r =
      side === 'buy'
        ? await window.tradingPro.paper.buy(token, {
            symbol,
            name: name || symbol,
            kind,
            quantity: q,
          })
        : await window.tradingPro.paper.sell(token, { symbol, kind, quantity: q });
    setBusy(false);
    if (!r?.ok) {
      setError(r?.error || 'Echec de l\'ordre.');
      return;
    }
    const msg =
      side === 'buy'
        ? `Achat execute · ${q} ${(name || symbol).slice(0, 18)} @ ${r.price?.toFixed(2)} $ (frais ${r.fee?.toFixed(2)} $)`
        : `Vente executee · ${q} ${(name || symbol).slice(0, 18)} @ ${r.price?.toFixed(2)} $ (P&L ${r.realized?.toFixed(2)} $)`;
    setSuccess(msg);
    // Refresh immediat des donnees parent puis fermeture
    await onExecuted(msg);
    setTimeout(onClose, 900);
  };

  // Sync quantity / usdAmount
  const handleQuantityChange = (v: string) => {
    setQuantity(v);
    if (price && v) setUsdAmount((parseFloat(v) * price).toFixed(2));
    else setUsdAmount('');
  };
  const handleUsdChange = (v: string) => {
    setUsdAmount(v);
    if (price && v) setQuantity((parseFloat(v) / price).toFixed(8).replace(/0+$/, '').replace(/\.$/, ''));
    else setQuantity('');
  };

  const total = price && parseFloat(quantity) ? price * parseFloat(quantity) : 0;
  const fee = total * 0.001;

  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm grid place-items-center z-50 p-6">
      <div className="card p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            {side === 'buy' ? (
              <span className="text-accent-green">Acheter</span>
            ) : (
              <span className="text-accent-red">Vendre</span>
            )}{' '}
            {name || symbol}
          </h2>
          <button onClick={onClose} className="text-text-dim hover:text-text">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                disabled={!!initialSymbol}
              >
                <option value="crypto">Crypto</option>
                <option value="stock">Action</option>
              </select>
            </div>
            <div>
              <label className="label">Symbole</label>
              <input
                className="input"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder={kind === 'crypto' ? 'bitcoin' : 'AAPL'}
                disabled={!!initialSymbol}
              />
            </div>
          </div>

          {!initialName && (
            <div>
              <label className="label">Nom (optionnel)</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bitcoin"
              />
            </div>
          )}

          <div className="card p-3 bg-bg-soft/40 border-bg-border flex items-center justify-between">
            <div className="text-xs text-text-dim">Prix marche</div>
            <div className="flex items-center gap-2">
              {price && <span className="font-mono font-semibold">{fmtCurrency(price)}</span>}
              <button onClick={fetchPrice} className="text-text-dim hover:text-accent text-xs">
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantite</label>
              <input
                type="number"
                step="any"
                min="0"
                className="input font-mono"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Montant ($)</label>
              <input
                type="number"
                step="any"
                min="0"
                className="input font-mono"
                value={usdAmount}
                onChange={(e) => handleUsdChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="card p-3 bg-bg-soft/40 border-bg-border text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Sous-total</span>
              <span className="font-mono">{fmtCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Frais (0.1%)</span>
              <span className="font-mono text-text-dim">{fmtCurrency(fee)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-bg-border mt-1">
              <span className="font-bold">{side === 'buy' ? 'Cout total' : 'Reception nette'}</span>
              <span className="font-mono font-extrabold">
                {fmtCurrency(side === 'buy' ? total + fee : total - fee)}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/30 rounded-lg p-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-accent-green bg-accent-green/10 border border-accent-green/30 rounded-lg p-2.5">
              {success}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={busy || !symbol || !quantity || !price}
              className={
                side === 'buy'
                  ? 'btn-primary flex-1 bg-accent-green hover:bg-accent-green text-bg'
                  : 'btn-primary flex-1 bg-accent-red hover:bg-accent-red text-bg'
              }
            >
              {busy && <Loader2 className="animate-spin" size={14} />}
              {side === 'buy' ? 'Confirmer l\'achat' : 'Confirmer la vente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRESETS = [
  { label: '10 000 $', value: 10_000 },
  { label: '100 000 $', value: 100_000 },
  { label: '1 M $', value: 1_000_000 },
  { label: '10 M $', value: 10_000_000 },
  { label: '100 M $', value: 100_000_000 },
  { label: 'Illimite', value: 999_000_000_000 },
];

function ResetModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (balance?: number) => void | Promise<void>;
}) {
  const [custom, setCustom] = useState('');
  const [selected, setSelected] = useState<number>(999_000_000_000);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const balance = custom ? Number(custom.replace(/[^\d.]/g, '')) : selected;
    await onConfirm(balance);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="card max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1">Reinitialiser le simulateur</h3>
        <p className="text-sm text-text-muted mb-5">
          Toutes les positions et l'historique seront effaces.
          Choisis ton solde de depart :
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => {
                setSelected(p.value);
                setCustom('');
              }}
              className={
                'p-3 rounded-lg border text-sm font-semibold transition ' +
                (selected === p.value && !custom
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-bg-border hover:border-accent/40 text-text')
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mb-5">
          <label className="label">Ou montant personnalise (USD)</label>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="50000"
            className="input font-mono"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-soft flex-1">Annuler</button>
          <button
            onClick={submit}
            disabled={busy}
            className="btn-primary bg-accent-red hover:bg-accent-red text-bg flex-1"
          >
            {busy && <Loader2 className="animate-spin" size={14} />}
            Reinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
