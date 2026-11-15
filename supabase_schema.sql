-- Run this whole file once in Supabase -> SQL Editor -> New query.

create table if not exists public.portfolio (
  id int primary key,
  owner_id uuid references auth.users(id),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.portfolio enable row level security;

-- Everyone can read the site; only the owner can write.
drop policy if exists "public read" on public.portfolio;
create policy "public read" on public.portfolio for select using (true);
drop policy if exists "owner insert" on public.portfolio;
create policy "owner insert" on public.portfolio for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "owner update" on public.portfolio;
create policy "owner update" on public.portfolio for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Realtime: lets the public site refresh instantly after you publish.
do $$ begin
  alter publication supabase_realtime add table public.portfolio;
exception when duplicate_object then null; end $$;

-- Media bucket (public read, owner-only write inside her own folder).
insert into storage.buckets (id, name, public) values ('portfolio-media','portfolio-media',true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'portfolio-media');
drop policy if exists "media owner write" on storage.objects;
create policy "media owner write" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "media owner update" on storage.objects;
create policy "media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "media owner delete" on storage.objects;
create policy "media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media' and (storage.foldername(name))[1] = auth.uid()::text);
