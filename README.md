# Collective Dream Observatory

A React + Firebase dream platform for two audiences at once:

- everyday dreamers who want to record, import, privately analyze, and selectively share dreams;
- researchers who need structured public dream records, taxonomy metadata, aggregate pattern summaries, and privacy-aware exports.

The old public name “Collective Dream Database” is now treated as the research/archive module name. The user-facing product direction is **Collective Dream Observatory**.

## Current feature set

### Privacy-first dream recording

- New dreams are private by default.
- After saving, the owner can keep a dream private, share anonymously, share with a pseudonym, or contribute it only to aggregated statistics.
- Dream analysis text is framed as reflection and research coding, not diagnosis.
- Owners can unpublish and delete records.

### Import Dream Diary

The app now includes a separate `ImportDreamDiaryPage` for people who already have dream diaries.

Supported first-version formats:

- `.txt`
- `.md` / `.markdown`
- `.csv`
- `.json`

Supported parsing modes:

- automatic detection;
- one dream per blank section;
- one dream per date heading;
- Markdown heading sections;
- CSV rows;
- JSON arrays / JSON objects with dream-like fields.

Imported dreams are reviewed as drafts first. The user can edit, split, merge, remove, approve, and import selected dreams. Every imported dream is saved as private by default.

### Automatic title and tag suggestions

The importer includes local, evidence-based suggestion scaffolding:

- neutral title suggestions;
- taxonomy-based direct-content tags;
- confidence and evidence phrases;
- private-name/adult/self-harm warning flags;
- `titleSource`, `titleConfidence`, `tagsSource`, and `tagsReviewedByUser` metadata.

This is intentionally conservative. Production AI tagging should use a server-side function and a strict JSON schema so the model cannot invent uncontrolled fields.

### Collective Patterns dashboard

The public archive includes aggregate statistics for:

- emotions;
- recurring symbols;
- dream types;
- languages;
- countries/regions;
- nightmare/lucid counts;
- dream length bins;
- tag co-occurrence;
- sample size, filters, missing dates, and small-sample warnings.

Small-group statistics are suppressed before display/export.

### My Dream Map

The private user dashboard includes a personal dream map with:

- dream frequency;
- emotional trends;
- recurring places;
- recurring people/entities;
- common symbols;
- lucid/nightmare counts;
- similar dreams;
- reflection questions without fixed interpretation or diagnosis.

### Researcher exports

The research archive now includes downloadable exports:

- public/readable dream records as CSV;
- public/readable dream records as JSON;
- collective pattern summary as JSON;
- taxonomy/codebook as CSV;
- methodology notes as Markdown.

The personal dashboard also includes owner-only private exports:

- personal dream records as CSV;
- personal dream records as JSON.

Browser research exports intentionally do **not** include private dream text or stats-only dream text. To include consented private/statistics-only records in collective public summaries, implement a server-side aggregation pipeline that writes privacy-safe aggregate documents.

## Firebase setup checklist

Use `FIREBASE_SETUP_CHECKLIST.md` before deployment. It lists Authentication providers, Firestore rules, Storage rules, likely indexes, Supabase image-bucket setup, and research-export boundaries.

## Firebase files

- `src/lib/firebaseClient.js` initializes Auth, Firestore, and Storage.
- `src/lib/recordsService.js` handles dream record creation, privacy/sharing metadata, and record updates.
- `src/lib/dreamDiaryImportService.js` handles file validation, parsing, diary draft generation, Storage upload, and import batch documents.
- `src/lib/researchExportService.js` builds CSV/JSON/Markdown exports.
- `firestore.rules` includes record, sharing, custom tag, and import batch validation.
- `storage.rules` restricts uploaded diary files to the authenticated owner path.

## Environment

Create `.env` from `.env.example` and configure Firebase:

```txt
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Optional Capacitor sync:

```bash
npx cap sync
```

## Research and ethics notes

- Do not describe dream tags or AI reflections as diagnosis.
- Keep dreams private by default.
- Separate user-confirmed, AI-suggested, moderator-coded, and researcher-coded tags.
- Show sample size, date range, filters, and limitations with statistics.
- Suppress small groups before public display or export.
- For large uploads and AI tagging at scale, use server-side queues and rate limits instead of doing all work in the browser.
