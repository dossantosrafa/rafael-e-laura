-- EXECUTAR UMA VEZ no Supabase SQL Editor (depois de criar o projeto).
-- As memórias e fotos são PÚBLICAS PARA LEITURA; somente os dois admins podem alterar.

create table if not exists public.album_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.album_memories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  story text not null check (char_length(story) between 1 and 5000),
  event_date date not null,
  photo_paths text[] not null default '{}',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint max_photos check (cardinality(photo_paths) <= 6)
);

alter table public.album_admins enable row level security;
alter table public.album_memories enable row level security;

-- Administração: cada usuário só consegue consultar sua própria inscrição.
drop policy if exists "admin_view_self" on public.album_admins;
create policy "admin_view_self" on public.album_admins for select to authenticated using (user_id = (select auth.uid()));

-- Qualquer visitante pode ler memórias; somente admins podem criá-las, atualizá-las e excluir.
drop policy if exists "memories_public_select" on public.album_memories;
create policy "memories_public_select" on public.album_memories for select to anon, authenticated using (true);
drop policy if exists "memories_admin_insert" on public.album_memories;
create policy "memories_admin_insert" on public.album_memories for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.album_admins a where a.user_id = (select auth.uid())));
drop policy if exists "memories_admin_update" on public.album_memories;
create policy "memories_admin_update" on public.album_memories for update to authenticated
using (exists (select 1 from public.album_admins a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.album_admins a where a.user_id = (select auth.uid())));
drop policy if exists "memories_admin_delete" on public.album_memories;
create policy "memories_admin_delete" on public.album_memories for delete to authenticated
using (exists (select 1 from public.album_admins a where a.user_id = (select auth.uid())));

-- Bucket público: as imagens podem ser vistas sem login.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('album-fotos','album-fotos',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true, file_size_limit=10485760, allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Só os admins podem enviar/excluir imagens deste bucket.
-- Os uploads novos ficam organizados sob a pasta UUID do usuário.
drop policy if exists "album_admin_upload" on storage.objects;
create policy "album_admin_upload" on storage.objects for insert to authenticated
with check (bucket_id='album-fotos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.album_admins a where a.user_id=(select auth.uid())));
drop policy if exists "album_admin_delete_photo" on storage.objects;
create policy "album_admin_delete_photo" on storage.objects for delete to authenticated
using (bucket_id='album-fotos' and exists (select 1 from public.album_admins a where a.user_id=(select auth.uid())));

-- DEPOIS: criar duas contas em Authentication > Users, copiar os IDs e executar:
-- insert into public.album_admins(user_id) values
--   ('UUID-DA-CONTA-DO-RAFAEL'),
--   ('UUID-DA-CONTA-DA-LAURA')
-- on conflict do nothing;
