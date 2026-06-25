# Firebase deployment checklist for the new dream import/export functions

## 1. Enable Firebase products

Enable these in the Firebase console for the same project used by your `.env` values:

- Authentication: Email/password, Google, and Anonymous sign-in.
- Cloud Firestore: Native mode.
- Cloud Storage for Firebase: required for original dream-diary file uploads.
- Hosting or Vercel deployment: the app can still deploy through Vercel, but Firebase rules must be deployed separately.

## 2. Environment variables

Set these locally and in Vercel / your production host:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Without `VITE_FIREBASE_STORAGE_BUCKET`, the importer can still parse and create private dream records, but it cannot store the original uploaded diary file.

## 3. Deploy rules

From the project root:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,storage
```

You can also paste `firestore.rules` into Firebase Console → Firestore Database → Rules, then publish.

## 4. Collections used by the new functions

The current client writes these top-level collections:

```text
Records
ImportBatches
customTags
users/{uid}
```

Nested collections:

```text
ImportBatches/{batchId}/DraftDreams
users/{uid}/savedRecords
users/{uid}/following
users/{uid}/collections
users/{uid}/collections/{collectionId}/records
```

Storage path for original diary files:

```text
users/{uid}/dream-imports/{batchId}/{fileName}
```

## 5. Manual test checklist after deploying

Test these once in production:

1. Sign in anonymously.
2. Record one dream and confirm it is private by default.
3. Open the dream and switch sharing mode to anonymous public.
4. Unpublish the dream and confirm it disappears from the public archive.
5. Upload a `.txt` dream diary in Import Dream Diary.
6. Preview, edit, split, merge, delete, and import selected drafts.
7. Confirm imported dreams appear in My Dream Map and remain private.
8. Export My Dream Map as CSV/JSON.
9. Export Research Archive CSV/JSON/codebook/methodology from public records.
10. Try a mobile viewport and confirm top navigation scrolls horizontally instead of compressing text.

## 6. Research-data note

Browser researcher exports intentionally include only public/readable records. Private and statistics-only records should be included only through a future server-side aggregation pipeline that removes account identifiers and enforces consent before writing public summary documents.

## 7. Future server functions to add

For a research-grade platform, add Cloud Functions later for:

- Server-side aggregation of consented private stats-only records.
- Moderation queue and report handling.
- AI title/tag generation with model versioning.
- Export jobs for approved researchers.
- Scheduled backups / admin exports.
- Rate limiting for anonymous imports and submissions.
