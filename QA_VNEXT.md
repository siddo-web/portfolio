# QA report — November 5, 2026

- 21 Node automated tests: PASS.
- 56 JavaScript inline blocks compiled with Node syntax checking (the remaining importmap is JSON, not JavaScript): PASS.
- 100 local image/video/script/style references checked from canonical pages: 0 missing.
- 30 distinct Vercel redirect rules checked for duplicate sources: 0 duplicates.
- Five canonical service routes and social sharing metadata checked.
- Static project content counts: WordPress 13, Shopify 11, Webflow 11, Wix 11, Other CMS 14.
- Webflow includes 9 larger hanging prints and 11 below-gallery sticky cards, sharing one stacking context with scale/dim effects.
- Profile card restored from the previous locally layered artwork, with the 0–100% bounded loader.

**Browser limitation:** This workspace's Chromium browser blocked both HTTP and file URLs (`ERR_BLOCKED_BY_ADMINISTRATOR`). Live layout, interaction and cross-device screenshots could not be independently verified. Please preview locally in VS Code or on Vercel and check the 390px mobile, 768px tablet, and desktop layouts before launch.

**Content integrity:** The supplied project spreadsheet has one documented Webflow website and two Wix website references. The additional Webflow/Wix entries are visibly marked *Example brief* and are unpublished in the CMS project API. Do not remove that distinction until you upload real completed projects.

**SEO deployment:** Configure `SITE_URL=https://siddique-profile.vercel.app` in Vercel for canonical API-generated sitemap URLs. Verify `/sitemap.xml`, `/webflow/`, `/wix/`, and the redirect from `/graphic/` after deployment.
