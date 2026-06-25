# Firebase setup checklist for Collective Dream Observatory

## 1. Authentication

Enable these providers in Firebase Authentication:

- Anonymous sign-in
- Email/password, if you want email accounts
- Google, if you want Google sign-in

The app can save guest/private dream records through anonymous Firebase Auth.

## 2. Firestore

Create a Cloud Firestore database in Native mode.

Publish the project `firestore.rules` file in Firebase Console > Firestore Database > Rules, or deploy with:

```bash
firebase deploy --only firestore:rules
```

The new rules enforce:

- new dream records are private on create;
- owners can read/update/delete their own records;
- public records are readable by others;
- adult public records require an account profile age of 18+;
- ImportBatches and DraftDreams are owner-only;
- user profiles, saved records, following, and collections are owner-only.

## 3. Storage for dream diary imports

Enable Firebase Storage and publish `storage.rules`, or deploy with:

```bash
firebase deploy --only storage
```

Diary originals are stored only under:

```text
users/{uid}/dream-imports/{batchId}/{fileName}
```

Only the authenticated owner can read/delete those original diary files.

## 4. Firestore indexes to create when Firebase asks

The app may ask Firebase for composite indexes after you deploy, depending on your data and queries. Create indexes from the Firebase console link shown in the browser console.

Likely fields:

- `Records`: `isPublic`, `adultContent`, `minimumViewerAge`
- `Records`: `ownerId`
- `users/{uid}/savedRecords`: `savedAt`
- `users/{uid}/following`: `followedAt`
- `users/{uid}/collections/{collectionId}/records`: `collectedAt`

## 5. Supabase image bucket

Dream images still use Supabase Storage in the current code. Create a public Supabase bucket named by:

```text
VITE_SUPABASE_DREAM_IMAGES_BUCKET=dream-images
```

Keep the bucket public only if you want public dream images to render by URL. A later privacy upgrade should move dream images to owner-controlled storage or signed URLs.

## 6. Research exports

Browser exports include only public/readable records. Do not use browser exports for private/statistics-only text.

For professional research datasets that include private stats-only consent, build a server-side aggregation pipeline that writes aggregate summary documents without private text.

For full admin backups, use Firestore managed export/import to Cloud Storage, not the browser exporter.

## 7. Deployment

Build and deploy:

```bash
npm install
npm run build
firebase deploy --only hosting,firestore:rules,storage
```

For mobile shells:

```bash
npm run build
npx cap sync
```
