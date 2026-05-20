import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { fmtDate } from '@/lib/format';

interface Article {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  imageurl?: string;
  published_on?: number;
  categories?: string;
}

export default function News() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (query = '') => {
    setLoading(true);
    const r = await window.tradingPro.markets.news(query);
    setLoading(false);
    if (r?.ok) setItems(r.data);
  };

  useEffect(() => {
    load('');
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Newspaper size={22} className="text-accent" /> Actualites
          </h1>
          <p className="text-text-muted text-sm">
            Agregateur CryptoCompare (source publique, gratuite, sans cle).
          </p>
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load(q);
          }}
        >
          <input
            className="input w-64"
            placeholder="Filtrer par mot cle…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn-primary">Filtrer</button>
        </form>
      </div>

      {loading ? (
        <div className="text-text-muted">Chargement…</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => (
            <article
              key={a.id}
              className="card overflow-hidden cursor-pointer hover:border-accent/40 transition group"
              onClick={() => window.tradingPro.app.openExternal(a.url)}
            >
              {a.imageurl && (
                <div
                  className="h-40 bg-cover bg-center"
                  style={{ backgroundImage: `url(${a.imageurl})` }}
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-dim mb-1">
                  <span>{a.source}</span>
                  {a.published_on && <span>{fmtDate(a.published_on * 1000)}</span>}
                </div>
                <h3 className="font-semibold leading-snug group-hover:text-accent transition">
                  {a.title}
                </h3>
                <p className="text-sm text-text-muted line-clamp-2 mt-1">{a.body}</p>
                <div className="mt-2 text-xs text-accent flex items-center gap-1">
                  Lire <ExternalLink size={11} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
