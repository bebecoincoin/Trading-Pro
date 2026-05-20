import { useEffect, useState, useCallback, useRef } from 'react';
import { MessagesSquare, Send, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/store/auth';
import {
  getSupabase,
  ensureMyProfile,
  type RemoteMessage,
  type RemoteProfile,
  type RemoteConversation,
} from '../lib/supabase';
import { Avatar } from '../components/Avatar';

export function Messages() {
  const { user } = useAuth();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState<RemoteConversation[]>([]);
  const [active, setActive] = useState<RemoteConversation | null>(null);
  const [params, setParams] = useSearchParams();

  const loadConversations = useCallback(async () => {
    if (!user?.publicId) return;
    const sb = await getSupabase();
    if (!sb) {
      setConfigured(false);
      return;
    }
    setConfigured(true);
    const { data } = await sb
      .from('conversations')
      .select('*')
      .or('user_a.eq.' + user.publicId + ',user_b.eq.' + user.publicId)
      .order('last_message_at', { ascending: false });
    if (!data) return;

    const otherIds = data.map((c: any) => (c.user_a === user.publicId ? c.user_b : c.user_a));
    const { data: profs } = await sb.from('profiles').select('*').in('id', otherIds);
    const profMap: Record<string, RemoteProfile> = {};
    (profs || []).forEach((p: any) => (profMap[p.id] = p));

    const enriched: RemoteConversation[] = data.map((c: any) => ({
      ...c,
      other: profMap[c.user_a === user.publicId ? c.user_b : c.user_a],
    }));
    setConversations(enriched);

    // Auto-select via URL ?c=...
    const cid = params.get('c');
    if (cid && !active) {
      const found = enriched.find((c) => c.id === cid);
      if (found) setActive(found);
    }
  }, [user?.publicId, params, active]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let sub: any;
    (async () => {
      if (!user?.publicId) return;
      const sb = await getSupabase();
      if (!sb) return;
      sub = sb
        .channel('conv-feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () =>
          loadConversations()
        )
        .subscribe();
    })();
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [user?.publicId, loadConversations]);

  if (configured === false) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-slate-900/60 border border-yellow-700/50 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-yellow-400 mt-1" size={24} />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Messages non actives</h2>
            <p className="text-slate-300">
              Configure Supabase pour utiliser les messages prives. Voir page Forum.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-4">
        <MessagesSquare className="text-blue-400" /> Messages
      </h1>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-0">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="text-center text-slate-500 py-8 px-2 text-sm">
              Aucune conversation. Va dans <b>Communaute</b> et ouvre un profil pour en demarrer une.
            </div>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActive(c);
                setParams({ c: c.id });
              }}
              className={
                'w-full flex items-center gap-3 p-2 rounded-lg transition text-left ' +
                (active?.id === c.id ? 'bg-blue-600/20 ring-1 ring-blue-500/40' : 'hover:bg-slate-800')
              }
            >
              <Avatar src={c.other?.avatar_data} name={c.other?.username} size={40} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate">{c.other?.username || '—'}</div>
                <div className="text-xs text-slate-500 truncate">
                  {new Date(c.last_message_at).toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>
        {active ? (
          <ChatPane conversation={active} />
        ) : (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500">
            Selectionne une conversation
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPane({ conversation }: { conversation: RemoteConversation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RemoteMessage[]>([]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const sb = await getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(500);
    if (data) setMessages(data as any);
  }, [conversation.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let sub: any;
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      sub = sb
        .channel('msg-' + conversation.id)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: 'conversation_id=eq.' + conversation.id,
          },
          (payload) => {
            setMessages((m) => [...m, payload.new as any]);
          }
        )
        .subscribe();
    })();
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [conversation.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!body.trim() || !user?.publicId || busy) return;
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
    const txt = body.trim();
    setBody('');
    await sb.from('messages').insert({
      conversation_id: conversation.id,
      author_id: user.publicId,
      body: txt,
    });
    await sb
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);
    setBusy(false);
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col min-h-0">
      <div className="p-3 border-b border-slate-800 flex items-center gap-3">
        <Avatar src={conversation.other?.avatar_data} name={conversation.other?.username} size={40} />
        <div className="font-semibold text-white">{conversation.other?.username || '—'}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-6">Aucun message. Dis bonjour !</div>
        )}
        {messages.map((m) => {
          const mine = m.author_id === user?.publicId;
          return (
            <div key={m.id} className={'flex ' + (mine ? 'justify-end' : 'justify-start')}>
              <div
                className={
                  'max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ' +
                  (mine ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100')
                }
              >
                {m.body}
                <div className={'text-[10px] mt-1 opacity-70 ' + (mine ? 'text-blue-100' : 'text-slate-400')}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ecrire un message..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
        />
        <button
          onClick={send}
          disabled={busy || !body.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white flex items-center gap-2"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
