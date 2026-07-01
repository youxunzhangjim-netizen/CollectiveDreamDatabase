# Collective Dream Observatory Android Play Store Data Safety Draft

This is a draft for Play Console Data safety review. Confirm the final answers against the deployed production behavior before upload. Closed testing should use at least **12 testers** for **14 continuous days** when required.

## App Summary

**Collective Dream Observatory** lets users record dreams, import diary files, sketch dream images, keep records private, contribute anonymous statistics, or share sanitized public dream records.

## Data Collected Or Processed

### Account Information

- Email address when the user chooses email/password, Google, Microsoft, or another auth provider.
- User id from Firebase Authentication.
- Optional public username.
- Optional country/region, age, biological sex, and preferred language.
- Consent settings and privacy defaults.

Purpose:

- Account creation and login.
- Owner-only access to private Records.
- Language preference and privacy defaults.
- Data export and account deletion.

### User-Generated Dream Content

- Dream text.
- Optional dream title.
- Optional date bucket, period, tags, emotions, dream type, country/region, and language.
- Optional images and sketches uploaded by the user.
- Optional diary import files during import processing.

Purpose:

- Personal dream journaling.
- User-controlled anonymous public sharing.
- User-controlled research/statistical contribution.

Private protection:

- Private Records are owner-only.
- PublicDreams are sanitized public-readable documents.
- ResearchSignals are non-identifying metadata only.
- Stats-only dreams do not publish original dream text, title, images, sketches, raw import files, exact owner id, or private notes.

### ResearchSignals

ResearchSignals may include:

- record id hash.
- user group hash.
- language.
- month/year bucket.
- dream length bucket.
- tag slugs and categories.
- emotion tags.
- setting/entity/dream type/psychological observation categories.
- adult content boolean.
- sensitivity bucket.
- sharing mode.
- tag source.
- confirmation status.

ResearchSignals must not include:

- original dream text.
- private title.
- publicText.
- images or sketch URLs.
- private storage paths.
- email.
- direct owner id.
- exact timestamps.
- private notes.

### PublicDreams

PublicDreams may include only user-approved public fields:

- publicTitle.
- publicText.
- publicTags.
- publicLanguage.
- date bucket or public date if allowed.
- anonymous label or username/pseudonym if allowed.
- publicCreatedAt.
- adult content and content warnings.
- originalLanguage.
- sharingMode.
- public-safe image or sketch URLs only when explicitly allowed.

PublicDreams must not include:

- private dream text.
- private title.
- owner email.
- raw diary import files.
- private notes.
- owner-only storage paths.
- sensitive private metadata.

### Feedback And Reports

- Feedback category, severity, message, page route, language, device type, browser info, PWA/native context, status.
- Optional screenshot if the user provides it.
- Reports about dreams or users.

Purpose:

- Bug fixing.
- Privacy concern handling.
- Moderation and safety.

Guidance:

- The UI asks users not to paste private dream text into feedback unless they intentionally choose to.
- Feedback screenshots should be private unless support access is explicitly allowed.

### Product Analytics

Privacy-safe analytics may store:

- eventName.
- anonymous session id or hashed user id.
- timestamp.
- route.
- language.
- device type.
- app version.
- non-sensitive metadata.

Analytics must not store:

- dream text.
- private title.
- private image URLs.
- private sketch URLs.
- raw diary file contents.
- exact sensitive dream content.
- private storage paths.

## Data Sharing

Public sharing is user-controlled:

- PublicDreams are readable by the public only after user consent and sharing mode allow it.
- Stats-only records contribute anonymous non-text signals.
- Private Records are not public.

Service providers:

- Firebase Authentication, Firestore, and Storage may process account and app data.
- Supabase Storage may process user-uploaded dream images/sketches if configured for the project.
- Hosting and deployment providers may process normal app delivery logs.

The app should not sell personal data.

## User Controls

Users can:

- Export their dreams as CSV/JSON.
- Delete one dream.
- Delete all dreams.
- Delete account.
- Clear local offline drafts.
- View consent history.
- Change default privacy setting.
- Bulk apply privacy presets.
- Unpublish dreams.
- Keep dream text private while contributing anonymous statistics.

## Account Deletion

Account deletion should be available in-app and at:

```txt
https://collectivedreamdatabase.com/account/delete
```

Public support/contact:

```txt
https://collectivedreamdatabase.com/support
```

## Security Practices To Confirm In Play Console

- Data is encrypted in transit via HTTPS.
- Users can request data deletion.
- Private Records are protected by Firestore Security Rules.
- Public archive reads from PublicDreams, not owner-only Records.
- Research export uses PublicDreams and safe aggregate ResearchSignals.

## Not Diagnosis Statement

Use this wording in store listing and onboarding where appropriate:

```txt
Dream tags and statistics are for self-reflection and research. They are not medical, psychological, or psychiatric diagnosis.
```
