-- Files table
create table if not exists public.files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  size bigint not null,
  mime_type text not null,
  storage_path text not null unique,
  metadata jsonb default '{}'::jsonb,
  status file_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index files_user_id_idx on public.files(user_id);
create index files_created_at_idx on public.files(created_at desc);
create index files_status_idx on public.files(status);

-- RLS Policies
alter table public.files enable row level security;

create policy "Users can view their own files"
  on public.files for select
  using (auth.uid() = user_id);

create policy "Users can insert their own files"
  on public.files for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own files"
  on public.files for update
  using (auth.uid() = user_id);

create policy "Users can delete their own files"
  on public.files for delete
  using (auth.uid() = user_id);

-- Updated at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_files_updated_at
  before update on public.files
  for each row
  execute function update_updated_at_column();

