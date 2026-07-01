# Collective Dream Observatory Android Release Guide

This guide prepares the Android closed-testing build for **Collective Dream Observatory**.

## App Identity

- App name: Collective Dream Observatory
- Short name: Dream Observatory
- Chinese name: 集體夢境觀測站
- Spanish name: Observatorio Colectivo de Sueños
- Android package / application id: `app.collectivedream.observatory`
- Capacitor web directory: `dist`
- First closed-testing version: `versionName "1.0.0"`, `versionCode 1`

## Required Commands

Run from the project root:

```bash
npm install
npm run test:android
npm run build
npm run android:sync
npm run android:open
```

Android Studio should open the `android` project. Build the signed Android App Bundle from:

```txt
Android Studio > Build > Generate Signed App Bundle / APK > Android App Bundle
```

Upload the signed `.aab` to Google Play Console closed testing.

If `npm run android:build:debug` says `JAVA_HOME is not set`, install Android Studio or a JDK 17+ runtime and set `JAVA_HOME` to the JDK path. Android Studio usually includes a bundled JDK under its installation folder.

If `npm run android:open` cannot launch Android Studio, install Android Studio or set `CAPACITOR_ANDROID_STUDIO_PATH` to the Android Studio executable path.

## Version Bumps

Before every new Play upload:

1. Increase `versionCode` in `android/app/build.gradle`.
2. Update `versionName` if the user-facing version changes.
3. Run `npm run android:sync`.
4. Rebuild the signed Android App Bundle.

## Closed Testing Requirement

For a new Google Play Console developer account, plan for at least **12 testers** and **14 continuous days** of closed testing before production access review.

Recommended tester mix:

- 4 Android phone users on narrow screens.
- 2 larger Android/tablet users.
- 2 users who test diary import and export.
- 2 users who test privacy presets, public archive, report/block, and account deletion.
- 2 users who test English, Traditional Chinese, and Spanish switching.

## Android Manual Smoke Test

Run these in Android Studio emulator and at least one physical Android device:

- Launch app from icon.
- Open `/record`, save a dream with no image/sketch.
- Save a dream with images and a sketch.
- Confirm keyboard does not cover important fields.
- Import a diary file.
- Confirm offline draft saving and upload after reconnect.
- Open `/explore`, `/patterns`, `/dashboard`, `/privacy`, `/terms`, `/support`, and `/account/delete`.
- Switch night/morning appearance.
- Switch English, Traditional Chinese, and Spanish.
- Confirm PWA install/update prompts do not appear in the native Android app.
- Confirm feedback button works and does not include private dream text unless typed manually.
- Confirm report/block, export, and account deletion flows.

## Deep Links

The Android manifest accepts these HTTPS routes for:

- `https://collectivedreamdatabase.com/...`
- `https://www.collectivedreamdatabase.com/...`

Routes:

- `/record`
- `/import`
- `/explore`
- `/patterns`
- `/dashboard`
- `/privacy`
- `/terms`
- `/support`
- `/account/delete`

The app also reserves the custom scheme:

```txt
app.collectivedream.observatory://open
```

## Store Listing Notes

Short description:

```txt
Record dreams privately, share anonymously, and explore collective dream patterns.
```

Long description draft:

```txt
Collective Dream Observatory is a privacy-first dream journal, anonymous dream archive, and collective pattern research tool. Record dreams quickly, import diaries, add tags or sketches, keep text private, contribute anonymous statistics, or share selected dreams with the public archive.

Dream tags and statistics are for self-reflection and research. They are not medical, psychological, or psychiatric diagnosis.
```

## Required Public URLs

Before Play submission, verify these public pages work from the deployed site:

- Privacy Policy: `https://collectivedreamdatabase.com/privacy`
- Terms of Service: `https://collectivedreamdatabase.com/terms`
- Community Guidelines: `https://collectivedreamdatabase.com/community-guidelines`
- Support Contact: `https://collectivedreamdatabase.com/support`
- Account Deletion: `https://collectivedreamdatabase.com/account/delete`

## Native UX Notes

- Android safe-area and keyboard spacing are enabled only inside the Capacitor shell.
- PWA install and update prompts remain web-only.
- Dream recording, diary import, privacy controls, public archive, feedback, moderation, and data-rights features continue to run from the shared React code.
