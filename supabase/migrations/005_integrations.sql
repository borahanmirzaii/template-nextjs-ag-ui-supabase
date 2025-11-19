-- Integrations table
create table if not exists public.integrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null check (platform in ('google', 'notion', 'jira')),
  credentials jsonb not null, -- Encrypted by application layer
  config jsonb default '{}'::jsonb,
  status integration_status default 'disconnected',
  last_sync timestamptz,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, platform)
);

-- MCP tools table
create table if not exists public.mcp_tools (
  id uuid primary key default uuid_generate_v4(),
  integration_id uuid references public.integrations(id) on delete cascade not null,
  tool_name text not null,
  description text,
  input_schema jsonb not null,
  enabled boolean default true,
  usage_count int default 0,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index integrations_user_id_idx on public.integrations(user_id);
create index integrations_platform_idx on public.integrations(platform);
create index mcp_tools_integration_id_idx on public.mcp_tools(integration_id);

-- RLS Policies
alter table public.integrations enable row level security;
alter table public.mcp_tools enable row level security;

create policy "Users can manage their integrations"
  on public.integrations for all
  using (auth.uid() = user_id);

create policy "Users can view tools for their integrations"
  on public.mcp_tools for select
  using (
    exists (
      select 1 from public.integrations
      where integrations.id = mcp_tools.integration_id
      and integrations.user_id = auth.uid()
    )
  );

-- Updated at trigger
create trigger update_integrations_updated_at
  before update on public.integrations
  for each row
  execute function update_updated_at_column();

