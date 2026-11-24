create table if not exists public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  action_type text not null check (action_type in ('create_reminder','call_contact','send_message','daily_report','update_schedule')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'awaiting_approval' check (status in ('awaiting_approval','approved','running','completed','failed','cancelled')),
  requires_approval boolean not null default true,
  approved_at timestamptz,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agent_actions_owner_created_idx on public.agent_actions(owner_id,created_at desc);
create index if not exists agent_actions_queue_idx on public.agent_actions(status,created_at);
alter table public.agent_actions enable row level security;
