-- TANGA SCHOOLS HUB core schema. Apply only to a fresh Supabase project.
create extension if not exists pgcrypto;

do $$ begin
  create type public.school_type as enum ('government', 'private');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.school_status as enum ('pending', 'verified', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.member_role as enum ('school_admin', 'teacher', 'student', 'parent');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.platform_role as enum ('super_admin', 'regional_admin', 'district_admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  region text not null default 'Tanga', is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  school_type public.school_type not null, registration_number text unique,
  district_id uuid references public.districts(id) on delete restrict,
  ward text, address text, description text, phone text, email text, website text, logo_url text,
  status public.school_status not null default 'pending',
  created_by uuid not null references auth.users(id) on delete restrict,
  verified_at timestamptz, verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint school_name_length check (char_length(trim(name)) between 2 and 180),
  constraint school_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
create table if not exists public.platform_memberships (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  role public.platform_role not null, district_id uuid references public.districts(id) on delete cascade,
  created_at timestamptz not null default now(), unique (user_id, role, district_id)
);
create table if not exists public.school_memberships (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, role public.member_role not null,
  is_active boolean not null default true, created_at timestamptz not null default now(),
  unique (school_id, user_id)
);
create table if not exists public.school_news (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict, title text not null, slug text not null,
  excerpt text, content text not null, cover_image_url text, is_published boolean not null default false,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (school_id, slug), constraint news_title_length check (char_length(trim(title)) between 3 and 200)
);

create index if not exists schools_district_status_idx on public.schools(district_id, status);
create index if not exists schools_name_idx on public.schools using gin (to_tsvector('simple', name));
create index if not exists school_memberships_user_idx on public.school_memberships(user_id, is_active);
create index if not exists school_news_published_idx on public.school_news(school_id, is_published, published_at desc);
create index if not exists platform_memberships_district_idx on public.platform_memberships(district_id);
create index if not exists school_news_author_idx on public.school_news(author_id);
create index if not exists schools_created_by_idx on public.schools(created_by);
create index if not exists schools_verified_by_idx on public.schools(verified_by);

create schema if not exists private;
create or replace function private.is_platform_admin(required_roles public.platform_role[] default array['super_admin','regional_admin']::public.platform_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_memberships pm where pm.user_id = (select auth.uid()) and pm.role = any(required_roles));
$$;
create or replace function private.has_school_role(target_school uuid, allowed_roles public.member_role[] default array['school_admin']::public.member_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.school_memberships sm where sm.school_id = target_school and sm.user_id = (select auth.uid()) and sm.is_active and sm.role = any(allowed_roles));
$$;
create or replace function private.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name) values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', '')) on conflict (id) do nothing;
  return new;
end; $$;
create or replace function private.add_school_creator_as_admin()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.school_memberships (school_id, user_id, role) values (new.id, new.created_by, 'school_admin') on conflict (school_id, user_id) do nothing;
  return new;
end; $$;
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
revoke all on function private.add_school_creator_as_admin() from public, anon, authenticated;
revoke all on function private.is_platform_admin(public.platform_role[]) from public;
revoke all on function private.has_school_role(uuid, public.member_role[]) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_platform_admin(public.platform_role[]) to anon, authenticated;
grant execute on function private.has_school_role(uuid, public.member_role[]) to anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_auth_user();
drop trigger if exists on_school_created_add_creator on public.schools;
create trigger on_school_created_add_creator after insert on public.schools for each row execute function private.add_school_creator_as_admin();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists schools_set_updated_at on public.schools;
create trigger schools_set_updated_at before update on public.schools for each row execute function public.set_updated_at();
drop trigger if exists school_news_set_updated_at on public.school_news;
create trigger school_news_set_updated_at before update on public.school_news for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.districts enable row level security;
alter table public.schools enable row level security;
alter table public.platform_memberships enable row level security;
alter table public.school_memberships enable row level security;
alter table public.school_news enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.districts, public.schools, public.school_news to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.profiles, public.platform_memberships, public.school_memberships to authenticated;
grant insert, update, delete on public.schools, public.school_news to authenticated;

drop policy if exists profiles_select_self_or_platform_admin on public.profiles;
create policy profiles_select_self_or_platform_admin on public.profiles for select to authenticated using (id = (select auth.uid()) or private.is_platform_admin());
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists districts_public_read_active on public.districts;
create policy districts_public_read_active on public.districts for select to anon, authenticated using (is_active or private.is_platform_admin());
drop policy if exists districts_platform_admin_insert on public.districts;
create policy districts_platform_admin_insert on public.districts for insert to authenticated with check (private.is_platform_admin());
drop policy if exists districts_platform_admin_update on public.districts;
create policy districts_platform_admin_update on public.districts for update to authenticated using (private.is_platform_admin()) with check (private.is_platform_admin());
drop policy if exists districts_platform_admin_delete on public.districts;
create policy districts_platform_admin_delete on public.districts for delete to authenticated using (private.is_platform_admin());
drop policy if exists schools_public_read_verified on public.schools;
create policy schools_public_read_verified on public.schools for select to anon, authenticated using (status = 'verified' or created_by = (select auth.uid()) or private.is_platform_admin() or private.has_school_role(id));
drop policy if exists schools_authenticated_submit on public.schools;
create policy schools_authenticated_submit on public.schools for insert to authenticated with check (created_by = (select auth.uid()) and status = 'pending' and verified_at is null and verified_by is null);
drop policy if exists schools_admin_update on public.schools;
create policy schools_admin_update on public.schools for update to authenticated using (private.is_platform_admin() or private.has_school_role(id)) with check (private.is_platform_admin() or (private.has_school_role(id) and status in ('pending','verified')));
drop policy if exists schools_platform_admin_delete on public.schools;
create policy schools_platform_admin_delete on public.schools for delete to authenticated using (private.is_platform_admin(array['super_admin']::public.platform_role[]));
drop policy if exists platform_memberships_read_self_or_admin on public.platform_memberships;
create policy platform_memberships_read_self_or_admin on public.platform_memberships for select to authenticated using (user_id = (select auth.uid()) or private.is_platform_admin());
drop policy if exists school_memberships_read_self_or_school_admin on public.school_memberships;
create policy school_memberships_read_self_or_school_admin on public.school_memberships for select to authenticated using (user_id = (select auth.uid()) or private.has_school_role(school_id));
drop policy if exists school_news_public_published on public.school_news;
create policy school_news_public_published on public.school_news for select to anon, authenticated using ((is_published and exists (select 1 from public.schools s where s.id = school_id and s.status = 'verified')) or author_id = (select auth.uid()) or private.has_school_role(school_id) or private.is_platform_admin());
drop policy if exists school_news_school_admin_insert on public.school_news;
create policy school_news_school_admin_insert on public.school_news for insert to authenticated with check (author_id = (select auth.uid()) and private.has_school_role(school_id));
drop policy if exists school_news_school_admin_update on public.school_news;
create policy school_news_school_admin_update on public.school_news for update to authenticated using (private.has_school_role(school_id) or private.is_platform_admin()) with check (private.has_school_role(school_id) or private.is_platform_admin());
drop policy if exists school_news_school_admin_delete on public.school_news;
create policy school_news_school_admin_delete on public.school_news for delete to authenticated using (private.has_school_role(school_id) or private.is_platform_admin());
