import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _configured = false;
let _loading: Promise<SupabaseClient | null> | null = null;

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (_client) return _client;
  if (_loading) return _loading;

  _loading = (async () => {
    try {
      const cfg = await window.tradingPro.app.supabaseConfig();
      if (!cfg.url || !cfg.anonKey) {
        _configured = false;
        return null;
      }
      _client = createClient(cfg.url, cfg.anonKey, {
        realtime: { params: { eventsPerSecond: 10 } },
        auth: { persistSession: false },
      });
      _configured = true;
      return _client;
    } catch {
      _configured = false;
      return null;
    } finally {
      _loading = null;
    }
  })();

  return _loading;
}

export async function isSupabaseConfigured(): Promise<boolean> {
  await getSupabase();
  return _configured;
}

export interface RemoteProfile {
  id: string;
  username: string;
  avatar_data: string | null;
  bio: string | null;
  created_at: string;
}

export interface RemoteThread {
  id: string;
  author_id: string;
  category: string;
  title: string;
  body: string;
  reply_count: number;
  created_at: string;
  author?: RemoteProfile;
}

export interface RemoteReply {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: RemoteProfile;
}

export interface RemoteMessage {
  id: string;
  conversation_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface RemoteConversation {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  other?: RemoteProfile;
  last_body?: string | null;
}

export async function upsertProfile(p: {
  id: string;
  username: string;
  avatar_data?: string | null;
  bio?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const sb = await getSupabase();
  if (!sb) return { ok: false, error: 'Supabase non configure' };
  const { error } = await sb.from('profiles').upsert(
    {
      id: p.id,
      username: p.username,
      avatar_data: p.avatar_data ?? null,
      bio: p.bio ?? null,
    },
    { onConflict: 'id' }
  );
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] upsertProfile failed:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// Cache anti-rejouage : on n'upsert qu'une fois par session pour un userId donne
const _ensuredProfiles = new Set<string>();

export async function ensureMyProfile(user: {
  publicId?: string | null;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
}): Promise<boolean> {
  if (!user.publicId) return false;
  if (_ensuredProfiles.has(user.publicId)) return true;
  const r = await upsertProfile({
    id: user.publicId,
    username: user.username,
    avatar_data: user.avatarUrl ?? null,
    bio: user.bio ?? null,
  });
  if (r.ok) _ensuredProfiles.add(user.publicId);
  return r.ok;
}

export function invalidateProfileCache(publicId?: string | null) {
  if (publicId) _ensuredProfiles.delete(publicId);
}
