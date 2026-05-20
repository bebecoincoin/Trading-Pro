-- ============================================================
-- Trading Pro - Schema Supabase (forum + DMs + profils)
-- ============================================================
-- A executer dans : Supabase Dashboard > SQL Editor > New query
-- Une seule fois, lors du premier setup.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Profils publics ----------
create table if not exists public.profiles (
  id uuid primary key,
  username text not null,
  avatar_data text,
  bio text,
  created_at timestamptz not null default now()
);
create index if not exists idx_profiles_username on public.profiles (lower(username));

-- ---------- Threads (sujets) ----------
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('general','crypto','stocks','analysis','strategy','offtopic')),
  title text not null,
  body text not null,
  reply_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_threads_created on public.threads (created_at desc);
create index if not exists idx_threads_category on public.threads (category, created_at desc);
create index if not exists idx_threads_author on public.threads (author_id);

-- ---------- Replies (reponses) ----------
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_replies_thread on public.replies (thread_id, created_at asc);

-- Maintient le compteur reply_count sur threads
create or replace function public.bump_reply_count() returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.threads set reply_count = reply_count + 1 where id = new.thread_id;
  elsif (tg_op = 'DELETE') then
    update public.threads set reply_count = greatest(reply_count - 1, 0) where id = old.thread_id;
  end if;
  return null;
end $$;
drop trigger if exists trg_replies_count on public.replies;
create trigger trg_replies_count
after insert or delete on public.replies
for each row execute function public.bump_reply_count();

-- ---------- Conversations 1-to-1 ----------
-- Convention : on stocke user_a et user_b ordonnes (user_a < user_b)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);
create index if not exists idx_conv_a on public.conversations (user_a, last_message_at desc);
create index if not exists idx_conv_b on public.conversations (user_b, last_message_at desc);

-- ---------- Messages prives ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_conv on public.messages (conversation_id, created_at asc);

-- Met a jour last_message_at automatiquement
create or replace function public.bump_conv_lastmsg() returns trigger language plpgsql as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return null;
end $$;
drop trigger if exists trg_messages_lastmsg on public.messages;
create trigger trg_messages_lastmsg
after insert on public.messages
for each row execute function public.bump_conv_lastmsg();

-- ============================================================
-- RLS - Row Level Security
-- ============================================================
-- Pour un forum public ouvert, on autorise l'anon a lire tout
-- et a inserer / mettre a jour ses propres lignes.
-- (Note : l'app n'utilise PAS Supabase Auth, donc on accepte
-- l'anon. C'est suffisant pour un forum demo.)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.threads enable row level security;
alter table public.replies enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Lecture publique
drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select using (true);
drop policy if exists "read threads" on public.threads;
create policy "read threads" on public.threads for select using (true);
drop policy if exists "read replies" on public.replies;
create policy "read replies" on public.replies for select using (true);
drop policy if exists "read conv" on public.conversations;
create policy "read conv" on public.conversations for select using (true);
drop policy if exists "read msgs" on public.messages;
create policy "read msgs" on public.messages for select using (true);

-- Ecriture anon ouverte (forum demo)
drop policy if exists "write profiles" on public.profiles;
create policy "write profiles" on public.profiles for insert with check (true);
drop policy if exists "update profiles" on public.profiles;
create policy "update profiles" on public.profiles for update using (true) with check (true);

drop policy if exists "write threads" on public.threads;
create policy "write threads" on public.threads for insert with check (true);
drop policy if exists "write replies" on public.replies;
create policy "write replies" on public.replies for insert with check (true);

drop policy if exists "write conv" on public.conversations;
create policy "write conv" on public.conversations for insert with check (true);
drop policy if exists "update conv" on public.conversations;
create policy "update conv" on public.conversations for update using (true) with check (true);
drop policy if exists "write msgs" on public.messages;
create policy "write msgs" on public.messages for insert with check (true);

-- ============================================================
-- Realtime
-- ============================================================
-- Active le realtime pour les tables (a faire aussi dans le dashboard
-- Database > Replication > supabase_realtime > tables, ou via SQL ci-dessous)
alter publication supabase_realtime add table public.threads;
alter publication supabase_realtime add table public.replies;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
