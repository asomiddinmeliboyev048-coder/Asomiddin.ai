alter table public.agent_reminders add column if not exists source_key text;
create unique index if not exists agent_reminders_owner_source_key_uidx
  on public.agent_reminders(owner_id,source_key)
  where source_key is not null;
