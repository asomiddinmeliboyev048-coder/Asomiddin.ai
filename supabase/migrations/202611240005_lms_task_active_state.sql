alter table public.lms_tasks add column if not exists is_active boolean not null default true;
create index if not exists lms_tasks_owner_active_due_idx on public.lms_tasks(owner_id,is_active,due_at);
