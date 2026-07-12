-- Buat tabel direktori terpisah dari kategori
create table if not exists public.directories (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  parent_id uuid references public.directories(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint directories_pkey primary key (id)
);

create index if not exists idx_directories_user_id on public.directories(user_id);
create index if not exists idx_directories_parent_id on public.directories(parent_id);

alter table public.directories enable row level security;

create policy "Directories readable by owner"
  on public.directories for select
  using (auth.uid() = user_id);

create policy "Directories insertable by owner"
  on public.directories for insert
  with check (auth.uid() = user_id);

create policy "Directories updateable by owner"
  on public.directories for update
  using (auth.uid() = user_id);

create policy "Directories deletable by owner"
  on public.directories for delete
  using (auth.uid() = user_id);

-- Tambah kolom directory_id ke dokumen untuk menghubungkan dokumen ke direktori
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'documents' and column_name = 'directory_id'
  ) then
    alter table public.documents add column directory_id uuid references public.directories(id) on delete set null;
    create index if not exists idx_documents_directory_id on public.documents(directory_id);
  end if;
end $$;
