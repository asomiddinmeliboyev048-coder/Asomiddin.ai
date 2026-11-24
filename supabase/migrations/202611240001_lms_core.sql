create table if not exists public.lms_tasks (
  owner_id text not null,
  external_id text not null,
  course text,
  title text not null,
  url text,
  due_at timestamptz,
  grade numeric,
  passing_grade numeric,
  status text not null default 'unknown',
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, external_id)
);
create table if not exists public.lms_events (
  id bigint generated always as identity primary key,
  owner_id text not null,
  event_type text not null,
  external_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.lms_sync_status (
  owner_id text primary key,
  last_sync_at timestamptz,
  course_count integer not null default 0,
  task_count integer not null default 0,
  error text,
  updated_at timestamptz not null default now()
);
create index if not exists lms_tasks_owner_due_idx on public.lms_tasks(owner_id, due_at);
create index if not exists lms_events_owner_created_idx on public.lms_events(owner_id, created_at desc);
alter table public.lms_tasks enable row level security;
alter table public.lms_events enable row level security;
alter table public.lms_sync_status enable row level security;
-- Service-role worker access bypasses RLS. Add user-scoped authenticated policies
-- only after the app's Supabase Auth identity is wired to owner_id.
