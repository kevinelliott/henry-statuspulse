-- Ensure all tables exist with IF NOT EXISTS

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'growth')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Status pages table
create table if not exists public.status_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  custom_domain text,
  is_public boolean not null default true,
  overall_status text not null default 'operational' check (overall_status in ('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Components table
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.status_pages(id) on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'operational' check (status in ('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Incidents table
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.status_pages(id) on delete cascade not null,
  title text not null,
  status text not null default 'investigating' check (status in ('investigating', 'identified', 'monitoring', 'resolved')),
  impact text not null default 'none' check (impact in ('none', 'minor', 'major', 'critical')),
  body text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Incident updates table
create table if not exists public.incident_updates (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade not null,
  status text not null check (status in ('investigating', 'identified', 'monitoring', 'resolved')),
  body text not null,
  created_at timestamptz not null default now()
);

-- Incident components junction
create table if not exists public.incident_components (
  incident_id uuid references public.incidents(id) on delete cascade,
  component_id uuid references public.components(id) on delete cascade,
  primary key (incident_id, component_id)
);

-- Subscribers table (email alerts)
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.status_pages(id) on delete cascade not null,
  email text not null,
  confirmed boolean not null default false,
  token text not null default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  unique (page_id, email)
);

-- Uptime checks table
create table if not exists public.uptime_checks (
  id uuid primary key default gen_random_uuid(),
  component_id uuid references public.components(id) on delete cascade not null,
  status text not null check (status in ('up', 'down', 'degraded')),
  response_time_ms integer,
  checked_at timestamptz not null default now()
);

-- RLS Policies (enable if not enabled)
alter table public.profiles enable row level security;
alter table public.status_pages enable row level security;
alter table public.components enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_updates enable row level security;
alter table public.incident_components enable row level security;
alter table public.subscribers enable row level security;
alter table public.uptime_checks enable row level security;

-- Profiles policies
do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can view own profile') then
    create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where tablename='status_pages' and policyname='Users can CRUD own pages') then
    create policy "Users can CRUD own pages" on public.status_pages for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='status_pages' and policyname='Public can view public pages') then
    create policy "Public can view public pages" on public.status_pages for select using (is_public = true);
  end if;
  if not exists (select 1 from pg_policies where tablename='components' and policyname='Page owners can CRUD components') then
    create policy "Page owners can CRUD components" on public.components for all using (exists (select 1 from public.status_pages where id = components.page_id and user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='components' and policyname='Public can view components of public pages') then
    create policy "Public can view components of public pages" on public.components for select using (exists (select 1 from public.status_pages where id = components.page_id and is_public = true));
  end if;
  if not exists (select 1 from pg_policies where tablename='incidents' and policyname='Page owners can CRUD incidents') then
    create policy "Page owners can CRUD incidents" on public.incidents for all using (exists (select 1 from public.status_pages where id = incidents.page_id and user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='incidents' and policyname='Public can view incidents of public pages') then
    create policy "Public can view incidents of public pages" on public.incidents for select using (exists (select 1 from public.status_pages where id = incidents.page_id and is_public = true));
  end if;
  if not exists (select 1 from pg_policies where tablename='incident_updates' and policyname='Page owners can CRUD incident updates') then
    create policy "Page owners can CRUD incident updates" on public.incident_updates for all using (exists (select 1 from public.incidents i join public.status_pages sp on sp.id = i.page_id where i.id = incident_updates.incident_id and sp.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='incident_updates' and policyname='Public can view incident updates') then
    create policy "Public can view incident updates" on public.incident_updates for select using (exists (select 1 from public.incidents i join public.status_pages sp on sp.id = i.page_id where i.id = incident_updates.incident_id and sp.is_public = true));
  end if;
  if not exists (select 1 from pg_policies where tablename='incident_components' and policyname='Page owners can CRUD incident components') then
    create policy "Page owners can CRUD incident components" on public.incident_components for all using (exists (select 1 from public.incidents i join public.status_pages sp on sp.id = i.page_id where i.id = incident_components.incident_id and sp.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='incident_components' and policyname='Public can view incident components') then
    create policy "Public can view incident components" on public.incident_components for select using (exists (select 1 from public.incidents i join public.status_pages sp on sp.id = i.page_id where i.id = incident_components.incident_id and sp.is_public = true));
  end if;
  if not exists (select 1 from pg_policies where tablename='subscribers' and policyname='Page owners can view subscribers') then
    create policy "Page owners can view subscribers" on public.subscribers for select using (exists (select 1 from public.status_pages where id = subscribers.page_id and user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='subscribers' and policyname='Anyone can insert subscribers') then
    create policy "Anyone can insert subscribers" on public.subscribers for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='subscribers' and policyname='Subscribers can delete their own subscription') then
    create policy "Subscribers can delete their own subscription" on public.subscribers for delete using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='uptime_checks' and policyname='Page owners can view uptime checks') then
    create policy "Page owners can view uptime checks" on public.uptime_checks for select using (exists (select 1 from public.components c join public.status_pages sp on sp.id = c.page_id where c.id = uptime_checks.component_id and sp.user_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename='uptime_checks' and policyname='Public can view uptime checks for public pages') then
    create policy "Public can view uptime checks for public pages" on public.uptime_checks for select using (exists (select 1 from public.components c join public.status_pages sp on sp.id = c.page_id where c.id = uptime_checks.component_id and sp.is_public = true));
  end if;
end $$;

-- Function to create profile after user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger if not exists
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- Indexes (create if not exists)
create index if not exists status_pages_slug_idx on public.status_pages (slug);
create index if not exists status_pages_user_id_idx on public.status_pages (user_id);
create index if not exists components_page_id_idx on public.components (page_id);
create index if not exists incidents_page_id_idx on public.incidents (page_id);
create index if not exists incident_updates_incident_id_idx on public.incident_updates (incident_id);
create index if not exists subscribers_page_id_idx on public.subscribers (page_id);
create index if not exists uptime_checks_component_id_idx on public.uptime_checks (component_id, checked_at desc);
