import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const indexHtml = readText("index.html");
const app = readText("src/App.jsx");
const seoHead = readText("src/components/SeoHead.jsx");
const robots = readText("public/robots.txt");
const sitemap = readText("public/sitemap.xml");
const setup = readText("SEO_SETUP.md");

assert.ok(indexHtml.includes('name="google-site-verification"'));
assert.ok(indexHtml.includes("I4KYU9sXxXt2IuSO_d27mj9d5coiL9v_ePj8cVoqcrg"));
assert.ok(indexHtml.includes("Collective Dream Observatory — Record Dreams, Explore Collective Imagination"));
assert.ok(indexHtml.includes('property="og:image" content="https://collectivedreamdatabase.vercel.app/og-image.png"'));
assert.ok(indexHtml.includes('name="twitter:card" content="summary_large_image"'));
assert.ok(indexHtml.includes('rel="canonical" href="https://collectivedreamdatabase.vercel.app/"'));
assert.ok(indexHtml.includes('hreflang="zh-Hant"'));
assert.ok(indexHtml.includes('"@type": "WebSite"'));
assert.ok(indexHtml.includes('"@type": "WebApplication"'));

assert.ok(app.includes("SeoHead"));
assert.ok(seoHead.includes("Collective Dream Observatory — Record Dreams, Explore Collective Imagination"));
assert.ok(seoHead.includes("集體夢境觀測站是一個以隱私為核心的夢境記錄、公開分享與集體夢境統計平台"));
assert.ok(seoHead.includes("Observatorio Colectivo de Sueños es una plataforma centrada en la privacidad"));
assert.ok(seoHead.includes("Privacy Policy - Collective Dream Observatory"));
assert.ok(seoHead.includes("Research Archive - Collective Dream Observatory"));
assert.ok(seoHead.includes("noindex,nofollow"));

assert.ok(robots.includes("Sitemap: https://collectivedreamdatabase.vercel.app/sitemap.xml"));
assert.ok(robots.includes("Disallow: /admin"));
assert.ok(robots.includes("Disallow: /dashboard"));
assert.ok(sitemap.includes("<loc>https://collectivedreamdatabase.vercel.app/</loc>"));
assert.ok(sitemap.includes("<loc>https://collectivedreamdatabase.vercel.app/research</loc>"));
assert.ok(sitemap.includes("<loc>https://collectivedreamdatabase.vercel.app/account/delete</loc>"));
assert.ok(setup.includes("Google Search Console"));

[
  "public/favicon.ico",
  "public/favicon-48x48.png",
  "public/favicon-96x96.png",
  "public/icon-192.png",
  "public/icon-512.png",
  "public/icon-maskable-512.png",
  "public/apple-touch-icon.png",
  "public/og-image.png",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/about/index.html",
  "public/research/index.html",
  "public/privacy/index.html",
  "public/terms/index.html",
  "public/community-guidelines/index.html",
  "public/content-removal/index.html",
  "public/not-diagnosis/index.html",
  "public/support/index.html",
  "public/account/delete/index.html",
  "public/faq/index.html",
].forEach((file) => {
  assert.ok(existsSync(join(root, file)), `${file} is missing`);
  assert.ok(statSync(join(root, file)).size > 0, `${file} is empty`);
});

[
  "public/favicon-48x48.png",
  "public/favicon-96x96.png",
  "public/icon-192.png",
  "public/icon-512.png",
  "public/icon-maskable-512.png",
  "public/apple-touch-icon.png",
  "public/og-image.png",
].forEach((file) => {
  const bytes = readFileSync(join(root, file));
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

console.log("SEO readiness checks passed.");

function readText(file) {
  return readFileSync(join(root, file), "utf8");
}
