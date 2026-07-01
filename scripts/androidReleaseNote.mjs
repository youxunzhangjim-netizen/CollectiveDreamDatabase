const notes = [
  "Collective Dream Observatory Android closed-testing build",
  "",
  "Package: app.collectivedream.observatory",
  "Version: 1.0.0 (versionCode 1)",
  "",
  "Closed testing focus:",
  "- Fast dream recording, diary import, and offline drafts",
  "- Privacy-first sharing, stats-only contribution, and public archive",
  "- Dream Sketch Board on phone/tablet/desktop-sized WebView",
  "- Account data rights, moderation/reporting, feedback, and beta gate",
  "- English, Traditional Chinese, and Spanish UI",
  "",
  "Before upload:",
  "1. npm run test:android",
  "2. npm run build",
  "3. npm run android:sync",
  "4. npm run android:open",
  "5. Build a signed Android App Bundle in Android Studio.",
  "",
  "Closed testing reminder: configure at least 12 testers and keep the test active for 14 continuous days before production access review.",
];

console.log(notes.join("\n"));
