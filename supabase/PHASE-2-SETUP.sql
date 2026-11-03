-- Portfolio CMS — Phase 2 Supabase database schema
-- Run once in Supabase Dashboard → SQL Editor → New Query.
-- DO NOT put real Supabase keys, passwords or admin email addresses in GitHub.

create extension if not exists pgcrypto;

create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 130),
  category text not null check (category in (
    'web-development','web-design','design-brand','app-development','digital-marketing'
  )),
  year text not null default '',
  tags text not null default '',
  summary text not null default '',
  description text not null default '',
  url text not null default '',
  image text not null default '',
  gallery jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery)='array'),
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_projects_public_idx
  on public.portfolio_projects (featured desc, created_at desc)
  where published=true;

-- Deny public writes. Only the server's secret key may modify projects.
alter table public.cms_admins enable row level security;
alter table public.portfolio_projects enable row level security;
revoke all on public.cms_admins from anon,authenticated;
revoke all on public.portfolio_projects from anon,authenticated;
grant select on public.portfolio_projects to anon,authenticated;

drop policy if exists "Visitors can read published portfolio projects" on public.portfolio_projects;
create policy "Visitors can read published portfolio projects"
  on public.portfolio_projects for select to anon,authenticated
  using (published is true);

-- Media files are intentionally public because they are portfolio images.
-- Upload/delete are handled by authenticated server API with secret key only.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',true,2000000,array['image/webp','image/png','image/jpeg'])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- AFTER creating a user in Authentication → Users and confirming its email,
-- run the statement below separately, replacing the example email with the
-- actual email used in SUPABASE_ADMIN_EMAIL in Vercel.
--
-- insert into public.cms_admins (user_id)
-- select id from auth.users where lower(email) = lower('YOUR-ADMIN-EMAIL@example.com')
-- on conflict (user_id) do nothing;
--
-- Confirm it inserted exactly one row in Table Editor → cms_admins.
