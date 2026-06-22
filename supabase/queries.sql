-- Query examples optimized for anomalous-tag search.

-- 1) Search dreams by one specific anomaly tag.
select
  d.id,
  d.title,
  d.dream_date,
  d.generated_image_url,
  d.signal_coherence,
  u.pseudo_id
from public.tags t
join public.dream_tags dt on dt.tag_id = t.id
join public.dreams d on d.id = dt.dream_id
join public.users u on u.id = d.user_id
where t.category = 'Anomalies'
  and t.slug = 'gravity-reversal'
order by d.dream_date desc, d.created_at desc;

-- 2) Search dreams that contain all requested anomaly tags.
select
  d.id,
  d.title,
  d.dream_date,
  array_agg(t.slug order by t.slug) as matched_anomaly_tags
from public.dreams d
join public.dream_tags dt on dt.dream_id = d.id
join public.tags t on t.id = dt.tag_id
where t.category = 'Anomalies'
  and t.slug = any(array['gravity-reversal', 'time-stop'])
group by d.id
having count(distinct t.slug) = cardinality(array['gravity-reversal', 'time-stop'])
order by d.dream_date desc;

-- 3) Supabase RPC-friendly helper already created in schema.sql.
select *
from public.search_dreams_by_anomaly_tags(array['gravity-reversal'], true);

-- 4) Full-text search across dream title + text, then intersect with anomaly tags.
select
  d.id,
  d.title,
  d.dream_date,
  ts_rank(d.search_vector, plainto_tsquery('english', 'rising rain')) as rank
from public.tags t
join public.dream_tags dt on dt.tag_id = t.id
join public.dreams d on d.id = dt.dream_id
where t.category = 'Anomalies'
  and t.slug = 'gravity-reversal'
  and d.search_vector @@ plainto_tsquery('english', 'rising rain')
order by rank desc, d.dream_date desc;
