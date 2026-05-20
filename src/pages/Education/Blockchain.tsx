import { useState } from 'react';
import { BLOCKCHAINS } from '@/lib/blockchains';
import { Boxes, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

export default function Blockchain() {
  const [filter, setFilter] = useState<'all' | 1 | 2>('all');
  const chains = BLOCKCHAINS.filter((b) => filter === 'all' || b.layer === filter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Boxes size={22} className="text-accent" /> Blockchains
        </h1>
        <p className="text-text-muted text-sm">
          Comprendre les principales chaines, leur architecture et leurs ecosystemes.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 1, label: 'Layer 1' },
          { id: 2, label: 'Layer 2' },
        ].map((f: any) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm border',
              filter === f.id
                ? 'bg-accent text-bg border-accent'
                : 'border-bg-border text-text-muted hover:text-text hover:border-accent/40'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {chains.map((b) => (
          <div key={b.name} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-text-dim">
                  {b.category} · {b.launched}
                </div>
                <div className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                  {b.name}
                  <span className="text-xs font-mono text-text-dim">{b.ticker}</span>
                </div>
              </div>
              <span
                className={clsx(
                  'badge',
                  b.layer === 1 ? 'badge-violet' : 'badge-green'
                )}
              >
                L{b.layer}
              </span>
            </div>

            <p className="text-sm text-text-muted mt-2">{b.description}</p>

            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <Mini label="Consensus" value={b.consensus} />
              <Mini label="TPS" value={b.tps} />
              <Mini label="Frais moyens" value={b.fees} />
              <Mini label="Layer" value={`L${b.layer}`} />
            </div>

            <div className="mt-3">
              <div className="text-xs text-text-dim mb-1">Ecosysteme</div>
              <div className="flex flex-wrap gap-1.5">
                {b.ecosystems.map((e) => (
                  <span
                    key={e}
                    className="text-[11px] bg-bg-soft border border-bg-border rounded-md px-1.5 py-0.5"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.tradingPro.app.openExternal(b.website)}
                className="btn-soft text-xs"
              >
                Site officiel <ExternalLink size={11} />
              </button>
              <button
                onClick={() => window.tradingPro.app.openExternal(b.explorer)}
                className="btn-ghost text-xs"
              >
                Explorer <ExternalLink size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-text-dim">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  );
}
