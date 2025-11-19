-- Knowledge base table with vector embeddings
create table if not exists public.knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  file_id uuid references public.files(id) on delete cascade not null,
  content text not null,
  embedding vector(768), -- Using 768 for Gemini embeddings
  metadata jsonb default '{}'::jsonb,
  chunk_index int not null,
  created_at timestamptz default now()
);

-- Indexes
create index knowledge_base_user_id_idx on public.knowledge_base(user_id);
create index knowledge_base_file_id_idx on public.knowledge_base(file_id);

-- Vector similarity search index (using HNSW for faster queries)
create index knowledge_base_embedding_idx 
  on public.knowledge_base 
  using hnsw (embedding vector_cosine_ops);

-- RLS Policies
alter table public.knowledge_base enable row level security;

create policy "Users can view their own knowledge base"
  on public.knowledge_base for select
  using (auth.uid() = user_id);

create policy "System can insert into knowledge base"
  on public.knowledge_base for insert
  with check (true);

create policy "Users can delete their knowledge base entries"
  on public.knowledge_base for delete
  using (auth.uid() = user_id);

-- Vector similarity search function
create or replace function match_knowledge_base(
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count int default 10,
  filter_user_id uuid default null,
  filter_file_id uuid default null
)
returns table (
  id uuid,
  file_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kb.id,
    kb.file_id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where 
    (filter_user_id is null or kb.user_id = filter_user_id)
    and (filter_file_id is null or kb.file_id = filter_file_id)
    and 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;

