-- =====================================================================
-- Plot Genie: database setup
-- Run this whole file once in Supabase > SQL Editor > New query > Run
-- =====================================================================

-- ---------- Admins: the only accounts allowed to change data ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
drop policy if exists "admins can see themselves" on public.admins;
create policy "admins can see themselves" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Plots ----------
create table if not exists public.plots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  city text not null default '',
  area_value numeric not null check (area_value > 0),
  area_unit text not null default 'sqyd' check (area_unit in ('sqyd', 'sqft', 'acre')),
  price numeric not null check (price >= 0),
  price_negotiable boolean not null default false,
  facing text not null default '',
  approval text not null default '',
  description text not null default '',
  latitude double precision,
  longitude double precision,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.plot_images (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists plot_images_plot_id_idx on public.plot_images (plot_id);

-- ---------- Agent profile (single row) ----------
create table if not exists public.agent_profile (
  id int primary key default 1 check (id = 1),
  name text not null default '',
  tagline text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  instagram text not null default '',
  email text not null default '',
  bio text not null default '',
  experience_years int not null default 0,
  plots_sold int not null default 0,
  photo_path text not null default ''
);
insert into public.agent_profile (id, name, tagline)
values (1, 'Your Name', 'Trusted plots, clear titles, honest prices.')
on conflict (id) do nothing;

-- ---------- Row Level Security: everyone reads, only admins write ----------
alter table public.plots enable row level security;
alter table public.plot_images enable row level security;
alter table public.agent_profile enable row level security;

drop policy if exists "public read plots" on public.plots;
create policy "public read plots" on public.plots for select using (true);
drop policy if exists "admin write plots" on public.plots;
create policy "admin write plots" on public.plots for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read plot images" on public.plot_images;
create policy "public read plot images" on public.plot_images for select using (true);
drop policy if exists "admin write plot images" on public.plot_images;
create policy "admin write plot images" on public.plot_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read profile" on public.agent_profile;
create policy "public read profile" on public.agent_profile for select using (true);
drop policy if exists "admin write profile" on public.agent_profile;
create policy "admin write profile" on public.agent_profile for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Image storage ----------
insert into storage.buckets (id, name, public)
values ('plot-images', 'plot-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read plot-images" on storage.objects;
create policy "public read plot-images" on storage.objects
  for select using (bucket_id = 'plot-images');

drop policy if exists "admin upload plot-images" on storage.objects;
create policy "admin upload plot-images" on storage.objects
  for insert to authenticated with check (bucket_id = 'plot-images' and public.is_admin());

drop policy if exists "admin update plot-images" on storage.objects;
create policy "admin update plot-images" on storage.objects
  for update to authenticated using (bucket_id = 'plot-images' and public.is_admin());

drop policy if exists "admin delete plot-images" on storage.objects;
create policy "admin delete plot-images" on storage.objects
  for delete to authenticated using (bucket_id = 'plot-images' and public.is_admin());

-- =====================================================================
-- LAST STEP (run separately, after creating your login user in
-- Authentication > Users > Add user). Replace the email with yours:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';
-- =====================================================================
