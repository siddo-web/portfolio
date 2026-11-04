# Portfolio revision — November 5, 2026

## Service categories
WordPress, Shopify, Webflow, Wix, Other CMS & Integrations, each with a distinct canonical URL and permanent redirect from the previous category page.

## Projects and transparent attribution
WordPress: 13 entries; Shopify: 11 entries; Webflow: 11 entries; Wix: 11 entries; Other CMS: 14 entries. The project master spreadsheet does **not** document ten actual client sites on Webflow or Wix. Additional Webflow/Wix cards are therefore marked **Example brief — not a completed client project**, not advertised as client deliveries. WordPress studio galleries are marked as subsections of one client website. Shopify components are distinguished from standalone stores. Any missing links or media are intentionally left unclaimed.

## Visual updates
- Previous original multi-layer profile-card artwork and flip/tilt effects restored.
- Original 0–100% loading sequence remains, no dependency on the removed remote 3D app.
- Webflow hanging prints enlarged with a larger available viewport calculation.
- Webflow now has a second stacked case-study section below the hanging prints.
- 10+ documented or clearly labelled entries on each service page.
- `.ms-services-dd summary { padding: 0; }` across service pages.

## Search visibility
Canonical service paths: `/wordpress/`, `/shopify/`, `/webflow/`, `/wix/`, `/other-cms/`. Vercel redirects all legacy service paths with 308 responses. Sitemap contains new canonical pages, no old graphic route. Original legacy HTML files also provide noindex redirects when opened outside Vercel. Set `SITE_URL=https://siddique-profile.vercel.app` in deployment settings, or change canonical tags if moving to a custom domain.

## Deployment
Extract the archive over the project root in VS Code, preserving `.git` and local `.env`; commit and push to `main`. After deploy, check all five service URLs, the 3D card overlay loader, and `https://siddique-profile.vercel.app/sitemap.xml`.
