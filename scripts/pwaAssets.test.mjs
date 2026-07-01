import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const packageJson = readJson("package.json");
const viteConfig = readText("vite.config.js");
const main = readText("src/main.jsx");
const app = readText("src/App.jsx");
const indexHtml = readText("index.html");
const offlineService = readText("src/lib/offlineDreamDraftService.js");

assert.equal(packageJson.dependencies["idb-keyval"], "^6.2.6");
assert.ok(packageJson.devDependencies["vite-plugin-pwa"]);
assert.ok(viteConfig.includes("VitePWA"));
assert.ok(viteConfig.includes('name: "Collective Dream Observatory"'));
assert.ok(viteConfig.includes('short_name: "Dream Observatory"'));
assert.ok(viteConfig.includes("Record Dream"));
assert.ok(viteConfig.includes("Import Diary"));
assert.ok(viteConfig.includes("Explore Dreams"));
assert.ok(viteConfig.includes("My Dream Map"));
assert.ok(viteConfig.includes("Collective Patterns"));
assert.ok(viteConfig.includes("url.origin === self.location.origin"));
assert.ok(viteConfig.includes("navigateFallback"));
assert.ok(viteConfig.includes("supabase"));

assert.ok(indexHtml.includes('<link rel="manifest" href="/manifest.webmanifest"'));
assert.ok(indexHtml.includes("apple-mobile-web-app-capable"));
assert.ok(indexHtml.includes("Dream Observatory"));

assert.ok(app.includes("useRegisterSW"));
assert.ok(app.includes("PWAInstallPrompt"));
assert.ok(app.includes("PWAUpdatePrompt"));
assert.ok(app.includes("OfflineStatusBanner"));
assert.ok(app.includes("cdo:save-current-record-draft"));
assert.ok(!main.includes("unregister()"));
assert.ok(!main.includes("caches.delete"));

assert.ok(offlineService.includes("createStore"));
assert.ok(offlineService.includes("OFFLINE_DRAFT_STATUS"));
assert.ok(!offlineService.includes("caches."));

[
  "public/icons/icon.svg",
  "public/icons/maskable-icon.svg",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
  "public/icons/maskable-icon-192.png",
  "public/icons/maskable-icon-512.png",
  "public/offline.html",
  "PWA_SETUP.md",
].forEach((file) => {
  assert.ok(existsSync(join(root, file)), `${file} is missing`);
});

[
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
  "public/icons/maskable-icon-192.png",
  "public/icons/maskable-icon-512.png",
].forEach((file) => {
  const path = join(root, file);
  const bytes = readFileSync(path);
  assert.ok(statSync(path).size > 256, `${file} should be a real PNG`);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

console.log("PWA assets and privacy-safe registration checks passed.");

function readText(file) {
  return readFileSync(join(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(readText(file));
}
