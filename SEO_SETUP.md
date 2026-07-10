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
4. This verification tag is already in `index.html`:

```html
<meta name="google-site-verification" content="I4KYU9sXxXt2IuSO_d27mj9d5coiL9v_ePj8cVoqcrg" />
```

5. Deploy the latest commit to Vercel.
6. In Search Console, click Verify.
7. Submit the sitemap:

```txt
https://collectivedreamdatabase.vercel.app/sitemap.xml
```

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
