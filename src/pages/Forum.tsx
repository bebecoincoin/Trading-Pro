import { useEffect, useMemo, useState, useCallback } from 'react';
import { MessageSquare, Plus, X, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../lib/store/auth';
import { getSupabase, ensureMyProfile, type RemoteThread, type RemoteReply, type RemoteProfile } from '../lib/supabase';
import { Avatar } from '../components/Avatar';
import { fmtDate as formatDate } from '../lib/format';

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'stocks', label: 'Actions' },
  { id: 'analysis', label: 'Analyse' },
  { id: 'strategy', label: 'Strategies' },
  { id: 'offtopic', label: 'Off-topic' },
];

export function Forum() {
  const { user } = useAuth();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [threads, setThreads] = useState<RemoteThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [activeThread, setActiveThread] = useState<RemoteThread | null>(null);

  const load = useCallback(async () => {
    const sb = await getSupabase();
    if (!sb) {
      setConfigured(false);
      return;
    }
    setConfigured(true);
    setLoading(true);
    let q = sb
      .from('threads')
      .select('*, author:profiles!threads_author_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (category !== 'all') q = q.eq('category', category);
    const { data, error } = await q;
    if (!error && data) setThreads(data as any);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime
  useEffect(() => {
    let sub: any;
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      sub = sb
        .channel('threads-feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, () => load())
        .subscribe();
    })();
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [load]);

  if (configured === false) {
    return <NotConfigured />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-blue-400" /> Forum
          </h1>
          <p className="text-slate-400 mt-1">Discute strategies, analyses, marche avec la communaute.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
            title="Rafraichir"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium flex items-center gap-2"
          >
            <Plus size={18} /> Nouveau sujet
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <CatChip active={category === 'all'} onClick={() => setCategory('all')}>Tous</CatChip>
        {CATEGORIES.map((c) => (
          <CatChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </CatChip>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {threads.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500">
            Aucun sujet pour l'instant. Sois le premier a poster !
          </div>
        )}
        {threads.map((t) => (
          <ThreadCard key={t.id} thread={t} onOpen={() => setActiveThread(t)} />
        ))}
      </div>

      {showCreate && user?.publicId && (
        <CreateThreadModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
          user={user}
        />
      )}

      {activeThread && (
        <ThreadDetailModal
          thread={activeThread}
          onClose={() => {
            setActiveThread(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: any }) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1.5 rounded-full text-sm font-medium transition ' +
        (active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700')
      }
    >
      {children}
    </button>
  );
}

function ThreadCard({ thread, onOpen }: { thread: RemoteThread; onOpen: () => void }) {
  const cat = CATEGORIES.find((c) => c.id === thread.category)?.label || thread.category;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-slate-900/70 hover:bg-slate-800 border border-slate-800 rounded-xl p-4 transition flex gap-4"
    >
      <Avatar src={thread.author?.avatar_data} name={thread.author?.username} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="font-semibold text-white truncate">{thread.title}</h3>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 shrink-0">{cat}</span>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{thread.body}</p>
        <div className="text-xs text-slate-500 mt-2 flex items-center gap-3">
          <span>par {thread.author?.username || '—'}</span>
          <span>{formatDate(new Date(thread.created_at).getTime())}</span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {thread.reply_count || 0}
          </span>
        </div>
      </div>
    </button>
  );
}

function CreateThreadModal({
  onClose,
  onCreated,
  user,
}: {
  onClose: () => void;
  onCreated: () => void;
  user: { publicId?: string | null; username: string; avatarUrl?: string | null; bio?: string | null };
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cat, setCat] = useState('general');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !body.trim()) {
      setError('Titre et message requis.');
      return;
    }
    if (!user.publicId) {
      setError('Profil non initialise. Reconnecte-toi.');
      return;
    }
    setBusy(true);
    setError(null);
    const sb = await getSupabase();
    if (!sb) {
      setError('Supabase non configure.');
      setBusy(false);
      return;
    }
    // Garantit que le profil existe avant le FK
    const ok = await ensureMyProfile(user);
    if (!ok) {
      setError('Impossible de creer le profil sur Supabase. Verifie ta connexion.');
      setBusy(false);
      return;
    }
    const { error: e } = await sb.from('threads').insert({
      title: title.trim(),
      body: body.trim(),
      category: cat,
      author_id: user.publicId,
    });
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    onCreated();
  }

  return (
    <Modal onClose={onClose} title="Nouveau sujet">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Categorie</label>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            placeholder="Ex: Analyse BTC, breakout ?"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white resize-y"
            placeholder="Detaille ton idee, tes chiffres, ton ressenti..."
          />
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white font-medium"
          >
            {busy ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ThreadDetailModal({ thread, onClose }: { thread: RemoteThread; onClose: () => void }) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<RemoteReply[]>([]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const loadReplies = useCallback(async () => {
    const sb = await getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from('replies')
      .select('*, author:profiles!replies_author_id_fkey(*)')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });
    if (data) setReplies(data as any);
  }, [thread.id]);

  useEffect(() => {
    loadReplies();
    let sub: any;
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      sub = sb
        .channel('replies-' + thread.id)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'replies', filter: 'thread_id=eq.' + thread.id },
          () => loadReplies()
        )
        .subscribe();
    })();
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [thread.id, loadReplies]);

  async function send() {
    if (!body.trim() || !user?.publicId) return;
    setBusy(true);
    const sb = await getSupabase();
    if (!sb) {
      setBusy(false);
      return;
    }
    const ok = await ensureMyProfile(user);
    if (!ok) {
      setBusy(false);
      return;
    }
    await sb.from('replies').insert({
      thread_id: thread.id,
      author_id: user.publicId,
      body: body.trim(),
    });
    setBody('');
    setBusy(false);
    loadReplies();
  }

  return (
    <Modal onClose={onClose} title={thread.title} wide>
      <div className="flex flex-col max-h-[70vh]">
        <div className="bg-slate-800/60 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Avatar src={thread.author?.avatar_data} name={thread.author?.username} size={36} />
            <div>
              <div className="text-white font-medium">{thread.author?.username || '—'}</div>
              <div className="text-xs text-slate-500">{formatDate(new Date(thread.created_at).getTime())}</div>
            </div>
          </div>
          <p className="text-slate-200 whitespace-pre-wrap">{thread.body}</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
          {replies.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-4">Aucune reponse. Lance la discussion !</div>
          )}
          {replies.map((r) => (
            <div key={r.id} className="bg-slate-900/70 rounded-lg p-3 flex gap-3">
              <Avatar src={r.author?.avatar_data} name={r.author?.username} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{r.author?.username || '—'}</span>
                  <span className="text-xs text-slate-500">{formatDate(new Date(r.created_at).getTime())}</span>
                </div>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-slate-800 pt-3">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Repondre..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
          />
          <button
            onClick={send}
            disabled={busy || !body.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white flex items-center gap-2"
          >
            <Send size={16} /> Envoyer
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({
  onClose,
  title,
  children,
  wide,
}: {
  onClose: () => void;
  title: string;
  children: any;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={'bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full ' + (wide ? 'max-w-3xl' : 'max-w-lg')}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="max-w-2xl mx-auto mt-12 bg-slate-900/60 border border-yellow-700/50 rounded-2xl p-8">
      <div className="flex items-start gap-4">
        <div className="bg-yellow-500/10 p-3 rounded-full">
          <AlertTriangle className="text-yellow-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Forum non active</h2>
          <p className="text-slate-300 mb-3">
            Le forum, la communaute et les messages prives utilisent <b>Supabase</b> (gratuit, 5 minutes de setup).
          </p>
          <ol className="text-slate-300 text-sm list-decimal ml-5 space-y-1">
            <li>Cree un projet sur <code className="bg-slate-800 px-1.5 py-0.5 rounded">supabase.com</code></li>
            <li>Recupere <code className="bg-slate-800 px-1.5 py-0.5 rounded">SUPABASE_URL</code> et <code className="bg-slate-800 px-1.5 py-0.5 rounded">SUPABASE_ANON_KEY</code></li>
            <li>Colle-les dans <code className="bg-slate-800 px-1.5 py-0.5 rounded">~/.config/trading-pro-app/.env</code></li>
            <li>Lance le SQL fourni dans <code className="bg-slate-800 px-1.5 py-0.5 rounded">supabase/schema.sql</code></li>
            <li>Relance l'application</li>
          </ol>
          <p className="text-slate-400 text-xs mt-4">
            Voir <code>docs/SUPABASE.md</code> pour les details.
          </p>
        </div>
      </div>
    </div>
  );
}
