# Collective Dream Observatory Android Closed Testing Checklist

Use this before inviting real closed beta testers. Closed testing should include **12 testers** for **14 continuous days** when required by Google Play Console.

## Build Verification

- [ ] `npm install`
- [ ] `npm run test:android`
- [ ] `npm run test:pwa`
- [ ] `npm run test:phase3`
- [ ] `npm run test:sketch`
- [ ] `npm run build`
- [ ] `npm run android:sync`
- [ ] `npm run android:open`
- [ ] Android Studio debug build launches.
- [ ] Signed Android App Bundle builds.

## Android App Identity

- [ ] Package is `app.collectivedream.observatory`.
- [ ] App label is `Collective Dream Observatory`.
- [ ] Version code is higher than any previous upload.
- [ ] Adaptive icon shows correctly on light and dark launchers.
- [ ] Splash screen uses the dark Observatory style.

## Closed Test Setup

- [ ] Create a closed testing track in Play Console.
- [ ] Add at least 12 testers or a tester group.
- [ ] Share the opt-in link only with invited testers.
- [ ] Keep testing active for 14 continuous days if Play Console requires it.
- [ ] Collect feedback through the in-app feedback button and direct support email.

## Route And Deep Link Checks

- [ ] `/record`
- [ ] `/import`
- [ ] `/explore`
- [ ] `/patterns`
- [ ] `/dashboard`
- [ ] `/privacy`
- [ ] `/terms`
- [ ] `/support`
- [ ] `/account/delete`
- [ ] Public policy/support pages are accessible when logged out.
- [ ] Beta gate does not block legal/support pages.

## Core Regression Checks

- [ ] Fast dream recording works as guest.
- [ ] Fast dream recording works while logged in.
- [ ] User can choose sharing mode at first save.
- [ ] Default sharing is anonymous public with statistics unless changed.
- [ ] Private dreams stay owner-only.
- [ ] Stats-only dreams do not publish text, title, images, or sketches.
- [ ] Anonymous public dreams appear in PublicDreams.
- [ ] Public archive reads sanitized PublicDreams only.
- [ ] ResearchSignals do not include private text or direct owner id.
- [ ] Diary import links imported dreams to the logged-in owner.
- [ ] Import can skip existing dreams.
- [ ] Custom tags stay available across languages.
- [ ] Dream Sketch Board can save, delete, and keep sketches private by default.
- [ ] Public sketches appear only when explicitly allowed.
- [ ] Public archive, Collective Patterns, My Dream Map, and researcher export still work.

## Offline And PWA-In-Native Checks

- [ ] Offline draft can be saved.
- [ ] Offline draft uploads after reconnect.
- [ ] PWA install prompt does not appear in native Android.
- [ ] PWA update prompt does not appear in native Android.
- [ ] Native app works in airplane mode for draft capture.

## Account And Data Rights

- [ ] Export my dreams as CSV.
- [ ] Export my dreams as JSON.
- [ ] Delete one dream.
- [ ] Delete all dreams.
- [ ] Delete account.
- [ ] Clear local offline drafts.
- [ ] View consent history.
- [ ] Bulk apply privacy preset to existing dreams.

## Trust And Safety

- [ ] Report dream.
- [ ] Report user.
- [ ] Block user.
- [ ] Reported content is hidden from reporter.
- [ ] Admin moderation dashboard is admin-only.
- [ ] Feedback dashboard is admin-only.
- [ ] Non-admin users cannot read admin dashboards.
- [ ] Adult/sensitive warnings are readable.
- [ ] Community Guidelines, Content Removal Policy, Terms, Privacy, Support, and Not Diagnosis pages are reachable.

## Privacy-Safe Analytics

- [ ] Events are created.
- [ ] Events do not contain dream text.
- [ ] Events do not contain private titles.
- [ ] Events do not contain private image or sketch URLs.
- [ ] Events do not contain raw diary file content.
- [ ] Event metadata remains useful for product metrics.

## Device Matrix

- [ ] Android phone, narrow width.
- [ ] Android phone, tall display.
- [ ] Android tablet.
- [ ] Foldable or wide emulator if available.
- [ ] Desktop browser regression after Capacitor sync.
- [ ] Installed PWA regression after Capacitor sync.

## Language And Appearance

- [ ] English UI.
- [ ] Traditional Chinese UI.
- [ ] Spanish UI.
- [ ] Night mode.
- [ ] Morning mode.
- [ ] Text hierarchy remains readable on laptop and phone.
- [ ] Buttons have sufficient contrast in both appearances.

## Known Manual Review Items

- [ ] Confirm Google Play Data safety answers match `ANDROID_PLAY_STORE_DATA_SAFETY_DRAFT.md`.
- [ ] Confirm privacy policy and account deletion URLs are live.
- [ ] Confirm support/contact inbox is monitored during the 14 continuous days.
