-- Collective Dream Database schema for PostgreSQL / Supabase
-- Logical table names requested: Users, Dreams, Tags, Dream_Tags.
-- Physical table names use lowercase snake_case to avoid quoted identifier issues in PostgreSQL.

begin;

-- Supabase projects normally provide UUID functionality; this keeps local Postgres installs compatible too.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Category ontology: intentionally small and controlled for consistent filtering.
do $$
begin
  create type public.tag_category as enum ('Environment', 'Entities', 'Anomalies');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key default extensions.gen_random_uuid(),
  pseudo_id text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  constraint users_pseudo_id_format check (pseudo_id ~ '^DREAMER-[A-Z0-9_-]{4,32}$')
);

comment on table public.users is 'Anonymous user profiles. pseudo_id is the public-facing identity; id is the internal primary key.';
comment on column public.users.pseudo_id is 'Anonymous public identifier such as DREAMER-7F3A9C.';

create table if not exists public.dreams (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  dream_text text not null,
  dream_date date not null,
  generated_image_url text,
  signal_coherence smallint not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(dream_text, ''))
  ) stored,
  constraint dreams_title_not_blank check (length(btrim(title)) > 0),
  constraint dreams_text_not_blank check (length(btrim(dream_text)) > 0),
  constraint dreams_signal_range check (signal_coherence between 0 and 100),
  constraint dreams_generated_image_url_format check (
    generated_image_url is null
    or generated_image_url ~* '^(https?://|/|data:image/)'
  )
);

comment on table public.dreams is 'Dream logs submitted by anonymous users. Full-text search is supported through search_vector.';
comment on column public.dreams.generated_image_url is 'URL or path for an AI-generated / generated dream thumbnail.';

create table if not exists public.tags (
  id uuid primary key default extensions.gen_random_uuid(),
  category public.tag_category not null,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint tags_name_not_blank check (length(btrim(name)) > 0),
  constraint tags_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tags_category_slug_unique unique (category, slug),
  constraint tags_category_name_unique unique (category, name)
);

comment on table public.tags is 'Ontology master list grouped into Environment, Entities, and Anomalies.';

create table if not exists public.dream_tags (
  dream_id uuid not null references public.dreams(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  confidence numeric(5,4) not null default 1.0,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  primary key (dream_id, tag_id),
  constraint dream_tags_confidence_range check (confidence between 0 and 1),
  constraint dream_tags_source_allowed check (source in ('manual', 'ai', 'hybrid'))
);

comment on table public.dream_tags is 'Junction table for the many-to-many relationship between dreams and ontology tags.';

-- Trigger for updated_at hygiene.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_dreams_set_updated_at on public.dreams;
create trigger trg_dreams_set_updated_at
before update on public.dreams
for each row
execute function public.set_updated_at();

-- Indexing strategy:
-- 1. Primary keys and unique constraints create their own indexes.
-- 2. The reverse junction index makes tag -> dream lookups fast.
-- 3. The partial anomaly index makes anomalous tag lookup especially selective.
create index if not exists idx_dreams_user_id on public.dreams(user_id);
create index if not exists idx_dreams_dream_date_desc on public.dreams(dream_date desc);
create index if not exists idx_dreams_search_vector on public.dreams using gin(search_vector);
create index if not exists idx_tags_category_slug on public.tags(category, slug);
create index if not exists idx_tags_anomaly_slug on public.tags(slug, id) where category = 'Anomalies';
create index if not exists idx_dream_tags_tag_id_dream_id on public.dream_tags(tag_id, dream_id);

-- Read-friendly view for the React dashboard.
create or replace view public.v_dream_cards
with (security_invoker = true)
as
select
  d.id as dream_id,
  d.title,
  left(d.dream_text, 220) as excerpt,
  d.dream_text,
  d.dream_date,
  d.generated_image_url,
  d.signal_coherence,
  d.created_at,
  d.updated_at,
  u.pseudo_id,
  coalesce(
    jsonb_agg(
      distinct jsonb_build_object(
        'id', t.id,
        'category', t.category,
        'name', t.name,
        'slug', t.slug
      )
    ) filter (where t.id is not null),
    '[]'::jsonb
  ) as tags,
  coalesce(
    array_agg(distinct t.slug) filter (where t.category = 'Anomalies'),
    array[]::text[]
  ) as anomaly_tag_slugs
from public.dreams d
join public.users u on u.id = d.user_id
left join public.dream_tags dt on dt.dream_id = d.id
left join public.tags t on t.id = dt.tag_id
group by d.id, u.pseudo_id;

comment on view public.v_dream_cards is 'Dashboard-facing dream cards with aggregated ontology tags.';

-- Optimized helper for searching dreams by one or more anomaly tag slugs.
create or replace function public.search_dreams_by_anomaly_tags(
  p_tag_slugs text[],
  p_match_all boolean default true
)
returns setof public.v_dream_cards
language sql
stable
as $$
  select v.*
  from public.v_dream_cards v
  where
    coalesce(array_length(p_tag_slugs, 1), 0) = 0
    or case
      when p_match_all then p_tag_slugs <@ v.anomaly_tag_slugs
      else p_tag_slugs && v.anomaly_tag_slugs
    end
  order by v.dream_date desc, v.created_at desc;
$$;

-- Supabase frontend reads. Insert/update/delete policies should be hardened per product rules.
alter table public.users enable row level security;
alter table public.dreams enable row level security;
alter table public.tags enable row level security;
alter table public.dream_tags enable row level security;

drop policy if exists "Public can read anonymous users" on public.users;
create policy "Public can read anonymous users"
on public.users
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read dreams" on public.dreams;
create policy "Public can read dreams"
on public.dreams
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read tags" on public.tags;
create policy "Public can read tags"
on public.tags
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read dream tags" on public.dream_tags;
create policy "Public can read dream tags"
on public.dream_tags
for select
to anon, authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.users, public.dreams, public.tags, public.dream_tags, public.v_dream_cards to anon, authenticated;
grant execute on function public.search_dreams_by_anomaly_tags(text[], boolean) to anon, authenticated;

commit;
