-- Supabase Storage setup for optional dream record pictures.
--
-- Bucket expected by the React app:
--   VITE_SUPABASE_DREAM_IMAGES_BUCKET=dream-images
--
-- The app uploads directly from the browser with the public anon key. Supabase
-- does not know the Firebase user session, so these policies allow public
-- browser uploads into this bucket. For stricter abuse control, replace direct
-- uploads with a server/API upload endpoint that verifies the Firebase token.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dream-images',
  'dream-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/json']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read dream images" on storage.objects;
create policy "Public can read dream images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'dream-images');

drop policy if exists "Browser can upload dream images" on storage.objects;
create policy "Browser can upload dream images"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'dream-images'
  and (storage.foldername(name))[1] = 'dream-records'
);

commit;
