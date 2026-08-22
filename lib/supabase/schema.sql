-- ============================================================================
-- Suara Fajar Deliksari — Skema Supabase PostgreSQL & Realtime
-- Jalankan seluruh script ini di SQL Editor pada dashboard Supabase Anda
-- ============================================================================

-- 1. State broadcast tunggal (satu baris)
create table if not exists public.app_state (
  id int primary key default 1,
  is_live boolean not null default false,
  is_demo boolean not null default true,
  media_on boolean not null default false,
  mic_on boolean not null default false,
  mute_on boolean not null default false,
  youtube_on boolean not null default false,
  camera_on boolean not null default false,
  blackout_on boolean not null default false,
  sync_on boolean not null default true,
  current_youtube_id text,
  current_youtube_title text,
  volume int not null default 80,
  updated_at timestamptz not null default now(),
  constraint only_one_row check (id = 1)
);
insert into public.app_state (id) values (1) on conflict (id) do nothing;

-- 2. Chat / Permohonan Doa Realtime
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  initial text not null default 'J',
  name text not null,
  message text not null
);
create index if not exists chats_created_at_idx on public.chats (created_at desc);

-- 3. Reaction Counter
create table if not exists public.reactions (
  emoji text primary key,
  label text not null,
  count bigint not null default 0,
  reset_date date not null default current_date
);
insert into public.reactions (emoji, label, count) values
  ('🙏', 'Amin', 0),
  ('❤️', 'Kasih', 0),
  ('🕊️', 'Damai', 0),
  ('✝️', 'Syukur', 0)
on conflict (emoji) do update
set label = excluded.label;

-- 4. Setlist / Antrian Lagu Pujian Latar
create table if not exists public.setlist (
  id uuid primary key default gen_random_uuid(),
  position int not null,
  youtube_id text not null,
  title text not null,
  is_playing boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists setlist_position_idx on public.setlist (position);

-- 5. Listener Heartbeat (Hitungan jemaat online realtime)
create table if not exists public.listeners (
  client_id text primary key,
  last_seen timestamptz not null default now()
);
create index if not exists listeners_last_seen_idx on public.listeners (last_seen desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================
alter table public.app_state  enable row level security;
alter table public.chats      enable row level security;
alter table public.reactions  enable row level security;
alter table public.setlist    enable row level security;
alter table public.listeners  enable row level security;

-- Public Read semua tabel
drop policy if exists "public read app_state" on public.app_state;
create policy "public read app_state" on public.app_state for select using (true);

drop policy if exists "public read chats" on public.chats;
create policy "public read chats" on public.chats for select using (true);

drop policy if exists "public read reactions" on public.reactions;
create policy "public read reactions" on public.reactions for select using (true);

drop policy if exists "public read setlist" on public.setlist;
create policy "public read setlist" on public.setlist for select using (true);

drop policy if exists "public read listeners" on public.listeners;
create policy "public read listeners" on public.listeners for select using (true);

-- Public Insert & Update untuk jemaat publik
drop policy if exists "public insert chats" on public.chats;
create policy "public insert chats" on public.chats for insert with check (true);

drop policy if exists "public insert listeners" on public.listeners;
create policy "public insert listeners" on public.listeners for insert with check (true);

drop policy if exists "public update listeners" on public.listeners;
create policy "public update listeners" on public.listeners for update using (true);

drop policy if exists "public insert reactions" on public.reactions;
create policy "public insert reactions" on public.reactions for insert with check (true);

drop policy if exists "public update reactions" on public.reactions;
create policy "public update reactions" on public.reactions for update using (true);

-- Admin State & Setlist CRUD
drop policy if exists "public insert setlist" on public.setlist;
create policy "public insert setlist" on public.setlist for insert with check (true);

drop policy if exists "public update setlist" on public.setlist;
create policy "public update setlist" on public.setlist for update using (true);

drop policy if exists "public delete setlist" on public.setlist;
create policy "public delete setlist" on public.setlist for delete using (true);

drop policy if exists "public update app_state" on public.app_state;
create policy "public update app_state" on public.app_state for update using (true);
