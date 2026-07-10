# Google Search Visibility Setup

Production URL used in metadata:

```txt
https://collectivedreamdatabase.vercel.app
```

## Google Search Console

1. Open Google Search Console.
2. Add a URL-prefix property:

```txt
https://collectivedreamdatabase.vercel.app/
```

3. Choose HTML tag verification.
4. This verification tag is already in [index.html](index.html):

```html
<meta name="google-site-verification" content="I4KYU9sXxXt2IuSO_d27mj9d5coiL9v_ePj8cVoqcrg" />
```

5. If Google gives a different tag later, replace the `content` value in `index.html`, deploy to Vercel, then verify again.
6. Deploy the latest commit to Vercel.
7. In Search Console, click Verify.
8. Submit the sitemap:

```txt
https://collectivedreamdatabase.vercel.app/sitemap.xml
```

## URL Inspection And Indexing

After verification, use URL Inspection for these public URLs:

```txt
https://collectivedreamdatabase.vercel.app/
https://collectivedreamdatabase.vercel.app/explore
https://collectivedreamdatabase.vercel.app/record
https://collectivedreamdatabase.vercel.app/patterns
https://collectivedreamdatabase.vercel.app/research
https://collectivedreamdatabase.vercel.app/about
https://collectivedreamdatabase.vercel.app/privacy
https://collectivedreamdatabase.vercel.app/terms
https://collectivedreamdatabase.vercel.app/community-guidelines
https://collectivedreamdatabase.vercel.app/support
```

For each important page:

1. Paste the URL into URL Inspection.
2. Confirm Google can fetch it.
3. Confirm it is not blocked by `robots.txt`.
4. Click Request indexing.

Do not request indexing for private app routes such as `/dashboard`, `/account`, `/admin`, `/moderation`, or `/offline-drafts`.

## Favicon In Google Results

Google chooses favicons on its own schedule. To help it update:

1. Confirm these files load:

```txt
https://collectivedreamdatabase.vercel.app/favicon.ico
https://collectivedreamdatabase.vercel.app/favicon-48x48.png
https://collectivedreamdatabase.vercel.app/favicon-96x96.png
https://collectivedreamdatabase.vercel.app/apple-touch-icon.png
https://collectivedreamdatabase.vercel.app/icon-512.png
```

2. Use URL Inspection on the homepage.
3. Request indexing.
4. Wait for Google to recrawl. Favicon changes can take several days to a few weeks to appear in search results.

## Timing

- Ownership verification can pass immediately after deployment.
- Sitemap discovery can appear within minutes to hours.
- URL indexing can take hours, days, or longer depending on Google crawl scheduling.
- Favicon and search result snippets may lag behind the indexed page.

## What Was Added

- Google verification meta tag.
- Homepage title and meta description.
- Canonical URL tags.
- Open Graph and Twitter/X preview tags.
- JSON-LD structured data for `WebSite`, `Organization`, and `WebApplication`.
- `robots.txt`.
- `sitemap.xml`.
- Public crawlable pages for About, Research, Privacy, Terms, Community Guidelines, Content Removal, Not Diagnosis, Support, FAQ, and Account Deletion.
- Root icon assets for favicon, Apple touch icon, PWA app icons, and social preview image.

## After Deployment Checks

Open these URLs directly:

```txt
https://collectivedreamdatabase.vercel.app/robots.txt
https://collectivedreamdatabase.vercel.app/sitemap.xml
https://collectivedreamdatabase.vercel.app/favicon.ico
https://collectivedreamdatabase.vercel.app/apple-touch-icon.png
https://collectivedreamdatabase.vercel.app/og-image.png
```

Then run:

- Google Search Console URL Inspection.
- Google Rich Results Test for the homepage.
- Lighthouse SEO audit.

## Notes

The React app also updates page-specific titles, descriptions, canonical URLs, Open Graph tags, and `robots` meta tags when users move between major views. Private account routes are marked `noindex` in the client and blocked in `robots.txt`.
