-- Supabase setup for joseluisandreu.com memorial site
-- Run this in Supabase SQL Editor after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 120),
  relationship text check (char_length(relationship) <= 160),
  message text not null check (char_length(message) <= 5000),
  caption text check (char_length(caption) <= 500),
  media_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.memories enable row level security;

-- Public website: anyone can read memories and add new ones.
-- Because the user asked for immediate public posts and direct uploads.
drop policy if exists "Public memories are readable" on public.memories;
create policy "Public memories are readable"
  on public.memories for select
  using (true);

drop policy if exists "Anyone can share a memory" on public.memories;
create policy "Anyone can share a memory"
  on public.memories for insert
  with check (true);

-- Create a public bucket in Dashboard > Storage named: memorial-media
-- Then add these storage policies if they are not automatically created.
-- Bucket should be public so gallery images/videos are viewable without signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memorial-media',
  'memorial-media',
  true,
  262144000,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','video/mp4','video/quicktime','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public memorial media is readable" on storage.objects;
create policy "Public memorial media is readable"
  on storage.objects for select
  using (bucket_id = 'memorial-media');

drop policy if exists "Anyone can upload memorial media" on storage.objects;
create policy "Anyone can upload memorial media"
  on storage.objects for insert
  with check (bucket_id = 'memorial-media');
