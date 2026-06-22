-- Mock ontology and dream data for Collective Dream Database.
-- This file inserts exactly 5 tag rows across the requested ontology categories.

begin;

insert into public.users (id, pseudo_id, created_at)
values
  ('00000000-0000-4000-8000-000000000001', 'DREAMER-7F3A9C', now() - interval '10 days'),
  ('00000000-0000-4000-8000-000000000002', 'DREAMER-C0BALT', now() - interval '9 days'),
  ('00000000-0000-4000-8000-000000000003', 'DREAMER-0B11QUE', now() - interval '8 days'),
  ('00000000-0000-4000-8000-000000000004', 'DREAMER-NULL9', now() - interval '7 days'),
  ('00000000-0000-4000-8000-000000000005', 'DREAMER-MNEME4', now() - interval '6 days')
on conflict (pseudo_id) do update set last_seen_at = excluded.created_at;

insert into public.tags (id, category, name, slug, description)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Environment',
    'Cyberpunk City',
    'cyberpunk-city',
    'Dense neon urban environments, usually nocturnal or rain-soaked.'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Environment',
    'Endless Water',
    'endless-water',
    'Oceanic, flooded, or infinite aquatic spaces with no visible boundary.'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Entities',
    'Non-human',
    'non-human',
    'Intelligent presences that are clearly not human, including hybrids and artificial beings.'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Anomalies',
    'Gravity Reversal',
    'gravity-reversal',
    'Perceived inversion, levitation, upward rain, falling upward, or altered gravitational rules.'
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Anomalies',
    'Time Stop',
    'time-stop',
    'Frozen environments, paused crowds, stopped clocks, or subjective time suspension.'
  )
on conflict (category, slug) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.dreams (
  id,
  user_id,
  title,
  dream_text,
  dream_date,
  generated_image_url,
  signal_coherence
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'Neon Rain Rising From the Street',
    'The observer stood in an alley where rain climbed upward from the pavement. Every drop reflected a different version of the same tower. Pedestrians moved without faces, and the traffic lights blinked in an impossible sequence.',
    '2026-06-12',
    null,
    91
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000002',
    'The Ocean With No Shoreline',
    'A black sea extended beneath a violet sky. The subject floated above the water, unable to determine whether the surface was liquid or glass. A voice beneath the waves repeated the same coordinates.',
    '2026-06-10',
    null,
    76
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000003',
    'The Station Clock Refused to Move',
    'The train station was full, but every passenger was frozen between gestures. Only the station clock appeared alive, breathing softly behind glass. The observer recognized nobody and yet knew every name.',
    '2026-06-08',
    null,
    84
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000004',
    'A City Suspended Under Water',
    'The city hung upside down beneath a transparent ocean. Vehicles moved along the underside of bridges while fish passed between office windows. The observer felt certain the scene was being archived by someone else.',
    '2026-06-04',
    null,
    88
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '00000000-0000-4000-8000-000000000005',
    'The Non-Human Archivist',
    'A tall figure made of porcelain and antennae asked the observer to classify memories by weather. The filing cabinets contained wet sand. Each drawer opened into the same flooded apartment.',
    '2026-05-29',
    null,
    69
  )
on conflict (id) do update set
  title = excluded.title,
  dream_text = excluded.dream_text,
  dream_date = excluded.dream_date,
  generated_image_url = excluded.generated_image_url,
  signal_coherence = excluded.signal_coherence;

insert into public.dream_tags (dream_id, tag_id, confidence, source)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 0.9600, 'hybrid'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', 0.9800, 'hybrid'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 0.7100, 'ai'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 0.9400, 'hybrid'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 0.7800, 'manual'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 0.6800, 'ai'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005', 0.9700, 'hybrid'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 0.8300, 'manual'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', 0.7900, 'ai'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 0.9100, 'hybrid'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000003', 0.9200, 'hybrid'),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', 0.6400, 'manual')
on conflict (dream_id, tag_id) do update set
  confidence = excluded.confidence,
  source = excluded.source;

commit;
