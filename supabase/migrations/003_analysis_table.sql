-- Analysis table
create table if not exists public.analysis (
  id uuid primary key default uuid_generate_v4(),
  file_id uuid references public.files(id) on delete cascade not null,
  status analysis_status default 'pending',
  result jsonb default '{}'::jsonb,
  insights jsonb default '[]'::jsonb,
  agent_type text not null,
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Indexes
create index analysis_file_id_idx on public.analysis(file_id);
create index analysis_status_idx on public.analysis(status);
create index analysis_created_at_idx on public.analysis(created_at desc);

-- RLS Policies
alter table public.analysis enable row level security;

create policy "Users can view analysis for their files"
  on public.analysis for select
  using (
    exists (
      select 1 from public.files
      where files.id = analysis.file_id
      and files.user_id = auth.uid()
    )
  );

create policy "System can insert analysis"
  on public.analysis for insert
  with check (true);

create policy "System can update analysis"
  on public.analysis for update
  using (true);

