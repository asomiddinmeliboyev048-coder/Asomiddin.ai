create table if not exists public.agent_reminders (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  title text not null,
  details text,
  remind_at timestamptz not null,
  timezone text not null default 'Asia/Tashkent',
  channel text not null default 'push',
  status text not null default 'scheduled' check (status in ('scheduled','sent','cancelled','failed')),
  source text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agent_reminders_due_idx on public.agent_reminders(status,remind_at);
create table if not exists public.call_summaries (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  provider_call_id text,
  caller_name text,
  caller_number text,
  intent text,
  summary text not null,
  requested_action text,
  urgency text not null default 'normal',
  callback_requested boolean not null default false,
  callback_after timestamptz,
  transcript_consent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists call_summaries_owner_created_idx on public.call_summaries(owner_id,created_at desc);
create table if not exists public.agent_preferences (
  owner_id text primary key,
  timezone text not null default 'Asia/Tashkent',
  class_end_report_enabled boolean not null default true,
  daily_report_time time,
  quiet_hours_start time,
  quiet_hours_end time,
  auto_callback_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.agent_reminders enable row level security;
alter table public.call_summaries enable row level security;
alter table public.agent_preferences enable row level security;
