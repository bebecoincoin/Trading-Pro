import { useState } from 'react';
import { BROKERS } from '@/lib/brokers';
import { Building2, ExternalLink, Star } from 'lucide-react';
import clsx from 'clsx';

const TYPES = ['all', 'stock', 'crypto', 'derivatives', 'forex'];

export default function Brokers() {
  const [type, setType] = useState('all');
  const brokers = BROKERS.filter((b) => type === 'all' || b.type.includes(type as any))
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Building2 size={22} className="text-accent" /> Brokers & Exchanges
        </h1>
        <p className="text-text-muted text-sm">
          Comparatif des plateformes : reglementation, frais, API.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm border capitalize',
              type === t
                ? 'bg-accent text-bg border-accent'
                : 'border-bg-border text-text-muted hover:text-text hover:border-accent/40'
            )}
          >
            {t === 'all' ? 'Tous' : t}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {brokers.map((b) => (
          <div key={b.name} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-text-dim">
                  {b.country} · {b.regulation.join(' · ')}
                </div>
                <div className="text-lg font-extrabold tracking-tight">{b.name}</div>
              </div>
              <div className="flex items-center gap-1 text-accent-gold font-mono font-bold">
                <Star size={14} className="fill-accent-gold" /> {b.rating.toFixed(1)}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-text-dim">Frais</div>
                <div className="font-mono">{b.fees}</div>
              </div>
              <div>
                <div className="text-xs text-text-dim">Depot min.</div>
                <div className="font-mono">{b.minDeposit}</div>
              </div>
              <div>
                <div className="text-xs text-text-dim">Type</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {b.type.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold uppercase bg-bg-soft border border-bg-border rounded-md px-1.5 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-dim">API publique</div>
                <div>
                  {b.apiAvailable ? (
                    <span className="badge-green">Oui</span>
                  ) : (
                    <span className="badge-red">Non</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-text-dim mb-1">Avantages</div>
                <ul className="text-sm space-y-1">
                  {b.pros.map((p, i) => (
                    <li key={i} className="text-accent-green/90 text-[13px]">
                      + {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-text-dim mb-1">Inconvenients</div>
                <ul className="text-sm space-y-1">
                  {b.cons.map((p, i) => (
                    <li key={i} className="text-accent-red/90 text-[13px]">
                      − {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => window.tradingPro.app.openExternal(b.url)}
              className="btn-soft mt-4 text-xs"
            >
              Site officiel <ExternalLink size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-4 text-xs text-text-muted">
        Reglementations citees : SEC/FINRA (USA), FCA (UK), AMF/ACPR (France), BaFin (Allemagne), CySEC (Chypre), MAS (Singapour). Verifie toujours les exigences locales avant ouverture de compte.
      </div>
    </div>
  );
}
