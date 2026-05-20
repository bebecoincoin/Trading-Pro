import { useEffect, useState, useCallback } from 'react';
import { Users, MessageCircle, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '../lib/store/auth';
import { getSupabase, ensureMyProfile, type RemoteProfile, type RemoteThread } from '../lib/supabase';
import { Avatar } from '../components/Avatar';
import { fmtDate as formatDate } from '../lib/format';
import { useNavigate } from 'react-router-dom';

export function Community() {
  const { user } = useAuth();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<RemoteProfile[]>([]);
  const [q, setQ] = useState('');
  const [active, setActive] = useState<RemoteProfile | null>(null);

  const load = useCallback(async () => {
    const sb = await getSupabase();
    if (!sb) {
      setConfigured(false);
      return;
    }
    setConfigured(true);
    if (user) await ensureMyProfile(user);
    const { data } = await sb.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) setProfiles(data as any);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (configured === false) {
    return <NotConfigured />;
  }

  const filtered = profiles
    .filter((p) => p.id !== user?.publicId)
    .filter((p) => !q || p.username.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-400" /> Communaute
          </h1>
          <p className="text-slate-400 mt-1">Decouvre les autres traders, consulte leur profil, lance une discussion privee.</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Chercher par pseudo..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">Aucun autre utilisateur pour l'instant.</div>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className="text-left bg-slate-900/70 hover:bg-slate-800 border border-slate-800 rounded-xl p-4 transition flex items-center gap-3"
          >
            <Avatar src={p.avatar_data} name={p.username} size={48} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{p.username}</div>
              <div className="text-xs text-slate-500">Inscrit {formatDate(new Date(p.created_at).getTime())}</div>
              {p.bio && <div className="text-sm text-slate-400 truncate mt-1">{p.bio}</div>}
            </div>
          </button>
        ))}
      </div>

      {active && <ProfileModal profile={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function ProfileModal({ profile, onClose }: { profile: RemoteProfile; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<RemoteThread[]>([]);

  useEffect(() => {
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      const { data } = await sb
        .from('threads')
        .select('*')
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setThreads(data as any);
    })();
  }, [profile.id]);

  async function startDM() {
    if (!user?.publicId || user.publicId === profile.id) return;
    const sb = await getSupabase();
    if (!sb) return;
    const ok = await ensureMyProfile(user);
    if (!ok) return;
    const a = user.publicId < profile.id ? user.publicId : profile.id;
    const b = user.publicId < profile.id ? profile.id : user.publicId;
    const { data: existing } = await sb
      .from('conversations')
      .select('id')
      .eq('user_a', a)
      .eq('user_b', b)
      .maybeSingle();
    let conversationId = existing?.id;
    if (!conversationId) {
      const { data: created } = await sb
        .from('conversations')
        .insert({ user_a: a, user_b: b })
        .select('id')
        .single();
      conversationId = created?.id;
    }
    if (conversationId) {
      navigate('/app/messages?c=' + conversationId);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <Avatar src={profile.avatar_data} name={profile.username} size={64} />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{profile.username}</h3>
            <p className="text-xs text-slate-500">Membre depuis {formatDate(new Date(profile.created_at).getTime())}</p>
            {profile.bio && <p className="text-sm text-slate-300 mt-2">{profile.bio}</p>}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={startDM}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} /> Lancer une discussion privee
          </button>
          <div>
            <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-2">Derniers sujets</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {threads.length === 0 && <div className="text-sm text-slate-500">Pas encore de sujet poste.</div>}
              {threads.map((t) => (
                <div key={t.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm font-medium text-white truncate">{t.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{formatDate(new Date(t.created_at).getTime())}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
          <h2 className="text-xl font-bold text-white mb-2">Communaute non activee</h2>
          <p className="text-slate-300">Configure Supabase pour decouvrir les autres traders. Voir page Forum pour les instructions.</p>
        </div>
      </div>
    </div>
  );
}
