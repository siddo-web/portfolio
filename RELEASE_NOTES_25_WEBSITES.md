# Updated portfolio — 25 owner-provided websites (November 5, 2026)

All 25 owner-supplied websites are now present in the portfolio. Five platform-specific service pages retain the original scroll-card layouts, and /webflow/ retains its hanging gallery plus sticky case studies. A separate /selected-sites/ page lists websites for which no CMS platform was provided, rather than inventing a platform.

**Confirmed platforms:** 5 WordPress, 1 Shopify, 2 Webflow, 1 Wix, 1 Squarespace, 1 Format CMS.
**Unconfirmed CMS:** 14 website URLs, shown with live links on /selected-sites/.

**Cards:** WordPress 18, Shopify 12, Webflow 13 sticky cards, Wix 12, Other CMS 16, Selected Sites 14. Existing example briefs are still clearly labelled and are not claimed as completed projects.

**What was preserved:** existing 3D profile card, its 0–100% loader, page fonts and spacing, the existing service cards, the website's scroll animations, and existing SEO redirects/canonicals. /selected-sites/ has its own canonical URL and is included in the sitemap.

**Pending media:** Newly added project previews are simple SVGs named for each website, labelled as screenshots/videos to be added. No website screenshots, project videos, ownership metrics or implementation specifics were fabricated. Add your own media and update the `shot` / `video` fields in the corresponding service page project records.

**Edit map:** `USER_PROJECTS_25_SITES.md` includes every domain and platform group. New selected website templates are in `selected-sites/index.html`. Project cards in the CMS API live in `content/projects.json`. Webflow hanging gallery and sticky cards are in `webflow/index.html`. Homepage links to /selected-sites/ from the additional-projects section.

**Verification:** 21 existing Node tests passed, 25 domains found on their respective pages, 58 embedded JavaScript blocks syntax-checked, and 0 missing active local assets across the six project pages. The live Vercel deployment and visual browser behaviour have not been checked in this workspace.

**Publish:** Extract this ZIP to your existing VS Code repository folder. Preserve `.git` and any local `.env`. Commit and push to main, then visit `/wordpress/`, `/shopify/`, `/webflow/`, `/wix/`, `/other-cms/`, `/selected-sites/`, and `/sitemap.xml`.
