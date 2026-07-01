import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const expectedAppId = "app.collectivedream.observatory";
const expectedName = "Collective Dream Observatory";

const packageJson = readJson("package.json");
const capacitor = readJson("capacitor.config.json");
const androidBuild = readText("android/app/build.gradle");
const manifest = readText("android/app/src/main/AndroidManifest.xml");
const strings = readText("android/app/src/main/res/values/strings.xml");
const styles = readText("android/app/src/main/res/values/styles.xml");
const appSource = readText("src/App.jsx");
const nativeSource = readText("src/lib/nativeApp.js");
const pwaInstallSource = readText("src/lib/pwaInstallService.js");
const pwaUpdateSource = readText("src/components/PWAUpdatePrompt.jsx");
const cssSource = readText("src/index.css");

assert.equal(capacitor.appId, expectedAppId);
assert.equal(capacitor.appName, expectedName);
assert.equal(capacitor.webDir, "dist");
assert.equal(capacitor.server.androidScheme, "https");
assert.equal(capacitor.plugins.SplashScreen.backgroundColor, "#030407");

assert.equal(packageJson.scripts["android:sync"], "npm run build && cap sync android");
assert.ok(packageJson.scripts["android:open"].includes("cap open android"));
assert.ok(packageJson.scripts["android:build:debug"].includes("gradlew.bat assembleDebug"));
assert.equal(packageJson.scripts["test:android"], "node scripts/androidReadiness.test.mjs");

assert.ok(androidBuild.includes(`namespace = "${expectedAppId}"`));
assert.ok(androidBuild.includes(`applicationId "${expectedAppId}"`));
assert.ok(androidBuild.includes("versionCode 1"));
assert.ok(androidBuild.includes('versionName "1.0.0"'));
assert.ok(existsSync(join(root, "android/app/src/main/java/app/collectivedream/observatory/MainActivity.java")));
assert.equal(
  existsSync(join(root, "android/app/src/main/java/com/collectivedreamdatabase/app/MainActivity.java")),
  false
);

assert.ok(strings.includes(`<string name="app_name">${expectedName}</string>`));
assert.ok(strings.includes(`<string name="package_name">${expectedAppId}</string>`));
assert.ok(strings.includes(`<string name="custom_url_scheme">${expectedAppId}</string>`));

assert.ok(manifest.includes('android:windowSoftInputMode="adjustResize"'));
assert.ok(manifest.includes('android:name="android.permission.INTERNET"'));
assert.ok(manifest.includes('android:host="collectivedreamdatabase.com"'));
assert.ok(manifest.includes('android:host="www.collectivedreamdatabase.com"'));
assert.ok(manifest.includes(`android:scheme="${expectedAppId}"`));
[
  "/record",
  "/import",
  "/explore",
  "/patterns",
  "/dashboard",
  "/privacy",
  "/terms",
  "/support",
  "/account/delete",
].forEach((path) => {
  assert.ok(manifest.includes(`android:pathPrefix="${path}"`), `${path} deep link is missing`);
});

assert.ok(existsSync(join(root, "android/app/src/main/res/values/colors.xml")));
assert.ok(existsSync(join(root, "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml")));
assert.ok(existsSync(join(root, "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml")));
assert.ok(existsSync(join(root, "android/app/src/main/res/drawable/splash.png")));
assert.ok(styles.includes("windowSplashScreenBackground"));
assert.ok(styles.includes("windowSplashScreenAnimatedIcon"));
assert.ok(styles.includes("postSplashScreenTheme"));
assert.ok(styles.includes("windowLightNavigationBar"));

assert.ok(nativeSource.includes("getNativePlatform"));
assert.ok(nativeSource.includes("isNativeAppShell"));
assert.ok(appSource.includes("dataset.nativePlatform"));
assert.ok(appSource.includes("cdo-native-shell"));
assert.ok(appSource.includes('normalized.startsWith("/account/delete")'));
assert.ok(pwaInstallSource.includes("isNativeAppShell"));
assert.ok(pwaUpdateSource.includes("isNativeAppShell"));
assert.ok(cssSource.includes('html[data-native-platform="android"]'));
assert.ok(cssSource.includes("scroll-margin-bottom: 8rem"));

[
  "ANDROID_PLAY_STORE_DATA_SAFETY_DRAFT.md",
  "ANDROID_CLOSED_TESTING_CHECKLIST.md",
  "ANDROID_RELEASE_GUIDE.md",
].forEach((file) => {
  const text = readText(file);
  assert.ok(text.includes("Collective Dream Observatory"), `${file} should name the app`);
  assert.ok(text.includes("12 testers") || text.includes("twelve testers"), `${file} should mention tester count`);
  assert.ok(text.includes("14 continuous days") || text.includes("14 days"), `${file} should mention the duration`);
});

const dataSafety = readText("ANDROID_PLAY_STORE_DATA_SAFETY_DRAFT.md");
assert.ok(dataSafety.includes("Dream text"));
assert.ok(dataSafety.includes("Account deletion"));
assert.ok(dataSafety.includes("PublicDreams"));
assert.ok(dataSafety.includes("ResearchSignals"));

const releaseGuide = readText("ANDROID_RELEASE_GUIDE.md");
assert.ok(releaseGuide.includes("npm run android:sync"));
assert.ok(releaseGuide.includes("npm run android:open"));
assert.ok(releaseGuide.includes("signed Android App Bundle"));
assert.ok(releaseGuide.includes("app.collectivedream.observatory"));

console.log("Android closed testing readiness checks passed.");

function readText(file) {
  return readFileSync(join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(readText(file));
}
