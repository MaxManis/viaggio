-- Viaggio · Supabase schema
-- Run this once in the Supabase dashboard → SQL editor → New query → Run.

-- 1) The single-document trip table.
create table if not exists public.trips (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- 2) Keep updated_at fresh on every write (used for last-write-wins sync).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at
  before insert or update on public.trips
  for each row execute function public.set_updated_at();

-- 3) Row-Level Security.
alter table public.trips enable row level security;

-- Starter policy: any signed-in user may read/write. Fine for testing.
drop policy if exists trips_authenticated on public.trips;
create policy trips_authenticated
  on public.trips
  for all
  to authenticated
  using (true)
  with check (true);

-- ⚠️ RECOMMENDED before real use: lock access to just you two by email.
-- Fill in both emails, run these two statements, and the open policy above is replaced.
--
-- drop policy if exists trips_authenticated on public.trips;
-- create policy trips_allowlist
--   on public.trips
--   for all
--   to authenticated
--   using      (auth.jwt() ->> 'email' in ('you@example.com', 'wife@example.com'))
--   with check (auth.jwt() ->> 'email' in ('you@example.com', 'wife@example.com'));

-- 4) Stream row changes to both devices over Realtime.
--    (If it errors with "already member", the table is already added — ignore it.)
alter publication supabase_realtime add table public.trips;
