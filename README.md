# Collective Dream Database

A complete React + Tailwind + Supabase/PostgreSQL starter for a dark cyberpunk “Collective Dream Database” dashboard.

## What is included

```txt
collective-dream-database/
├── src/
│   ├── components/CollectiveDreamDashboard.jsx
│   ├── data/fallbackDreams.js
│   ├── lib/supabaseClient.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   └── queries.sql
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── .env.example
```

## Database design

The schema uses four core tables that map to the requested logical names:

| Requested table | Physical table | Purpose |
|---|---|---|
| Users | `public.users` | Anonymous user profiles with public `pseudo_id` values. |
| Dreams | `public.dreams` | Dream text, dream date, generated image URL, and full-text search vector. |
| Tags | `public.tags` | Controlled ontology master list grouped into `Environment`, `Entities`, and `Anomalies`. |
| Dream_Tags | `public.dream_tags` | Many-to-many junction table between dreams and ontology tags. |

Physical table names are lowercase because PostgreSQL treats unquoted identifiers as lowercase. This avoids needing to quote mixed-case names like `"Dream_Tags"` in every query.

## Optimization for anomaly-tag search

The important indexes are:

```sql
create index if not exists idx_tags_anomaly_slug
on public.tags(slug, id)
where category = 'Anomalies';

create index if not exists idx_dream_tags_tag_id_dream_id
on public.dream_tags(tag_id, dream_id);
```

This lets PostgreSQL find the anomaly tag first, then traverse the junction table from `tag_id` to `dream_id` efficiently.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In the Supabase SQL editor, run:

```sql
-- 1. supabase/schema.sql
-- 2. supabase/seed.sql
```

4. Copy environment variables:

```bash
cp .env.example .env
```

5. Fill in `.env`:

```txt
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

6. Start the frontend:

```bash
npm run dev
```

The app will use Supabase when credentials are configured. Without credentials, it shows the same mock dataset from `src/data/fallbackDreams.js`.

## Useful SQL queries

Search for dreams tagged with `Gravity Reversal`:

```sql
select *
from public.search_dreams_by_anomaly_tags(array['gravity-reversal'], true);
```

Search for dreams with either `Gravity Reversal` or `Time Stop`:

```sql
select *
from public.search_dreams_by_anomaly_tags(array['gravity-reversal', 'time-stop'], false);
```

Search for dreams with both `Gravity Reversal` and `Time Stop`:

```sql
select *
from public.search_dreams_by_anomaly_tags(array['gravity-reversal', 'time-stop'], true);
```

## RLS note

`schema.sql` enables Row Level Security and creates read policies for the public dashboard. For production, insert/update/delete operations should go through authenticated flows, server-side functions, or carefully scoped policies rather than broad public writes.
