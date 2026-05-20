# ICCL Website

Static website for **Inhale Culture Celebrate Life Ltd (ICCL)** — built with [Eleventy](https://www.11ty.dev/) + [esbuild](https://esbuild.github.io/) and deployed to GitHub Pages.

## Structure

```
iccl-website/
├── src/
│   ├── _includes/
│   │   ├── base.njk           # full <html> shell — extends target for every page
│   │   ├── header.njk         # topbar + nav (build-time current-link highlighting)
│   │   └── footer.njk         # footer
│   ├── ts/
│   │   └── nav.ts             # mobile-nav toggle (TypeScript)
│   ├── index.njk              # Home
│   ├── festival.njk           # MOMO Fest 2026 recap
│   ├── about.njk              # Purpose, board, team, governance, contact
│   └── 404.njk                # Custom 404 page
├── assets/                    # Logo + photos (passthrough-copied)
├── styles.css                 # Single shared stylesheet
├── Constitution ... .pdf
├── eleventy.config.cjs        # Eleventy config (input: src, output: _site)
├── tsconfig.json
├── package.json
└── .github/workflows/deploy.yml
```

The pre-migration root-level HTML/JS files live in [Archive/](Archive/) for reference. They are not part of the build and can be deleted whenever you're ready.

## Develop

```sh
npm install      # one-time
npm run dev      # esbuild --watch + Eleventy --serve on http://localhost:8080
```

Pages live-reload on `.njk`, `.css`, and `.ts` changes.

## Build

```sh
npm run build    # outputs _site/
```

What it does:

1. `npm run clean` — removes the previous `_site/`.
2. `npm run build:ts` — bundles `src/ts/nav.ts` → `_site/nav.js` (minified).
3. `npm run build:html` — Eleventy renders `src/*.njk` → `_site/*.html` and passes through `styles.css` and `assets/`.
4. `npm run build:assets` — copies the Constitution PDF (its filename contains `()` which fast-glob misinterprets, so it's copied via plain `fs.copyFileSync`).

`npm run typecheck` runs `tsc --noEmit` if you want to validate types without rebuilding.

## Editing content

- **Header & footer** live in [src/_includes/header.njk](src/_includes/header.njk) and [src/_includes/footer.njk](src/_includes/footer.njk). Editing them updates every page in one shot.
- **Active nav link** is set at build time from the page's `currentPage` front-matter (`home` | `festival` | `about` | `none`) — no runtime JS needed.
- **Per-page topbar text** comes from `topbar_left` / `topbar_right` in the page's front matter. Set `topbar: false` to hide the topbar entirely (used by 404).
- **Pill in the nav** flips between two presets via `nav_pill: momofest` (defaults to the Facebook "Follow for updates" pill if unset).
- **Page-specific `<style>`** goes inside `{% block head_extra %}` — see [src/festival.njk](src/festival.njk) and [src/about.njk](src/about.njk).

## Deploy to GitHub Pages

A GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) builds and deploys on every push to `main`.

**One-time setup:**

1. Push this repo to GitHub.
2. **Settings → Pages** → set source to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the Actions tab) — the site goes live at `https://<your-username>.github.io/<repo>/`.

## Custom domain (iccl.org.au)

1. Add a `CNAME` file inside `src/` containing: `iccl.org.au` — and a passthrough rule in `eleventy.config.cjs` so it lands at `_site/CNAME`. Or just commit `CNAME` to the project root and add `eleventyConfig.addPassthroughCopy("CNAME")`.
2. In your DNS provider, point an `A` record to the GitHub Pages IPs:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   (optionally a `CNAME`: `www` → `<your-username>.github.io`)
3. In **Settings → Pages**, enter the custom domain and enable **Enforce HTTPS**.

## Images

`assets/` holds the production photos. To swap a hero photo, drop a new file into `assets/` and update the `<img src="...">` in the relevant `.njk` page.

> **Heads-up:** the file `MOMOFest-Thankyou. hero event.jpg` has a space and an extra period in its name. The page references it via URL-encoded `MOMOFest-Thankyou.%20hero%20event.jpg`. Renaming it to e.g. `momofest-thankyou.jpg` would let you drop the encoding — update the `<img src>` in [src/festival.njk](src/festival.njk) if you do.

The festival gallery section is currently wrapped in a Nunjucks `{# ... #}` comment in [src/festival.njk](src/festival.njk). Uncomment when the gallery photos are ready.

## SEO, structured data, and AI search

Site-wide constants live in [src/_data/site.js](src/_data/site.js) — name, legal name, canonical URL, address, ABN, social links, default OG image. Change the canonical URL in one place when switching from the GitHub Pages preview to `iccl.org.au`.

Every page automatically gets:

- `<title>`, `<meta name="description">`, `<link rel="canonical">` (driven by per-page front matter)
- Open Graph (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `og:locale`)
- Twitter / X card (`summary_large_image`)
- Favicon + apple-touch-icon
- Semantic `<main id="main">` wrapper
- A global JSON-LD `@graph` with `NGO` (Organization) + `WebSite` schemas referenced by `@id` so per-page schemas can link back to them without duplication

Per-page JSON-LD lives in a `{% block jsonld %}` in each page:

| Page | Page type | Extra structured data |
|---|---|---|
| `index.njk` | `WebPage` | `primaryImageOfPage` |
| `about.njk` | `AboutPage` | `BreadcrumbList` (matches the visible "ICCL · About" breadcrumb) |
| `festival.njk` | `Event` | `Place` (Footscray Park), `Offer` (free entry), `organizer` link |
| `404.njk` | — | `noindex,follow` meta + excluded from sitemap |

`robots.txt` and `sitemap.xml` are generated from [src/robots.njk](src/robots.njk) and [src/sitemap.njk](src/sitemap.njk). Pages opt out of the sitemap by setting `eleventyExcludeFromCollections: true`. Sitemap priority comes from each page's `sitemap_priority` front-matter value.

**Rule we enforce:** structured data only describes content that is actually visible on the page. No fake FAQs, no fake reviews, no hidden facts.

### Validate after deploy

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Open Graph debugger](https://www.opengraph.xyz/) — paste each URL
- Lighthouse (Chrome DevTools → Lighthouse) for SEO + Accessibility + Performance
- After custom-domain DNS is live, submit `https://iccl.org.au/sitemap.xml` in Google Search Console and Bing Webmaster Tools

## Security headers

All HTML pages set the following via `<meta http-equiv>`:

- `Content-Security-Policy`: `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; frame-ancestors 'none';`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

`'unsafe-inline'` is permitted in `style-src` because each page can have inline `style=""` attributes for one-off layout tweaks. Scripts are external (`nav.js`) so `script-src` stays strict.

For full HTTP-header security (not just meta), add a `_headers` file if you ever switch to Cloudflare Pages or Netlify.
