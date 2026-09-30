-- Run once in your Supabase project's SQL Editor.
-- The dashboard accesses these tables only through its authenticated Node server.
create table if not exists public.studio_users (
 id text primary key, username text unique not null, password text not null,
 role text not null check (role in ('admin','editor')), reset integer not null,
 active integer not null default 1
);
create table if not exists public.studio_sessions (
 token text primary key, user_id text not null references public.studio_users(id), expires bigint not null
);
create table if not exists public.studio_pages (
 id text primary key, owner text not null references public.studio_users(id), title text not null,
 blocks text not null, updated text not null, shared_by text
);
create index if not exists studio_pages_owner on public.studio_pages(owner);
create index if not exists studio_sessions_user on public.studio_sessions(user_id);
alter table public.studio_users enable row level security;
alter table public.studio_sessions enable row level security;
alter table public.studio_pages enable row level security;
revoke all on public.studio_users, public.studio_sessions, public.studio_pages from anon, authenticated;
grant select, insert, update, delete on public.studio_users, public.studio_sessions, public.studio_pages to service_role;
