import { useState } from 'react';
import { PRO_TRADERS } from '@/lib/proTraders';
import { ExternalLink, Trophy } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'fund', label: 'Fonds' },
  { id: 'whale', label: 'Whales' },
  { id: 'on-chain', label: 'On-chain' },
  { id: 'public', label: 'Public' },
];

export default function Traders() {
  const [cat, setCat] = useState('all');
  const traders = PRO_TRADERS.filter((t) => cat === 'all' || t.category === cat);

  const openExt = (url: string) => window.tradingPro.app.openExternal(url);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Trophy size={22} className="text-accent-gold" /> Pro Traders
          </h1>
          <p className="text-text-muted text-sm">
            Investisseurs reconnus dont les positions sont publiquement documentees.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm border',
              cat === c.id
                ? 'bg-accent text-bg border-accent'
                : 'border-bg-border text-text-muted hover:text-text hover:border-accent/40'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {traders.map((t) => (
          <div key={t.slug} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-text-dim">{t.role}</div>
                <div className="text-lg font-extrabold tracking-tight">{t.name}</div>
              </div>
              <span
                className={clsx(
                  'badge',
                  t.category === 'fund' && 'badge-violet',
                  t.category === 'whale' && 'badge-gold',
                  t.category === 'on-chain' && 'badge-green',
                  t.category === 'public' && 'badge-red'
                )}
              >
                {t.category}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-2">{t.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.primaryAssets.map((a) => (
                <span
                  key={a}
                  className="text-[11px] font-mono bg-bg-soft border border-bg-border rounded-md px-1.5 py-0.5 uppercase"
                >
                  {a}
                </span>
              ))}
            </div>

            {t.notableTrades.length > 0 && (
              <div className="mt-3 text-xs">
                <div className="text-text-dim uppercase tracking-wider mb-1">Mouvements notables</div>
                <ul className="space-y-1">
                  {t.notableTrades.map((m, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-text-dim w-16">{m.date}</span>
                      <span className="font-mono uppercase text-accent">{m.asset}</span>
                      <span className="text-text">{m.action}</span>
                      <span className="text-text-muted truncate">— {m.notes}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {t.publicLinks.map((l) => (
                <button
                  key={l.url}
                  onClick={() => openExt(l.url)}
                  className="btn-ghost text-xs py-1.5"
                >
                  {l.label} <ExternalLink size={12} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 text-xs text-text-muted">
        Sources : SEC EDGAR (13F), Etherscan, Arkham, WhaleAlert, sites officiels. Le suivi de
        ces portefeuilles est <strong>informatif</strong> et ne constitue pas une recommandation.
      </div>
    </div>
  );
}
