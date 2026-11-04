> **SUPERSEDED:** This document describes an earlier login-enabled build. The current version has no website login. Follow `README.md` and `NO_LOGIN_SECURITY_UPDATE.md` instead.

> **Newer changes:** The CMS Developer update supersedes the original five-services positioning described below. Read [CMS_DEVELOPER_UPDATE.md](CMS_DEVELOPER_UPDATE.md) first; the original galleries are the active service pages again.

# Updated Portfolio — November 4, 2026

This is a **clean, single-root GitHub + Vercel ZIP** (no nested duplicate site, `.git`, credentials or Netlify-exported full-page HTML captures). It preserves the existing homepage, five service areas, interactions and Jotform enquiry embed. All files are meant to be placed in the ROOT of the existing `siddo-web/portfolio` repository.

## What was fixed

- Kept the three inner-page demo-banner removals from the modified ZIP, and cleaned the App Development demo banner to match.
- The CMS now sorts **Featured** projects above ordinary work, with a visible featured label.
- The CMS editor has a **Replace sample projects on this service page** checkbox. This allows real CMS projects to replace the original hardcoded gallery on a selected service page. By default, the old gallery stays visible until a published project on that category has the checkbox checked. Original legacy cards cannot be edited individually through the CMS; they are static HTML and deliberately preserved as fallback so empty categories aren't blank.
- Restored the latest project record from the live GitHub repository into `content/projects.json`. Because it contains `Test Project` copy, it is set as a **draft** (not deleted); verify client/project rights and update it in CMS before publishing.
- Introduced a public `/api/projects` response containing **published projects only**; drafts are omitted, and `/content/projects.json` is rewritten to the filtered API on Vercel. **Caution:** the GitHub repository is PUBLIC; its commit history/JSON can still expose drafts. Do not put sensitive client information in a draft. Private draft storage requires a private database such as Supabase, which is NOT enabled in this default package.
- Removed old Netlify badges, captured third-party HTML pages, capture manifests, and disconnected cookie-consent banners. The Jotform embed was not changed.
- Reduced `webdev_portfolio/assets/media/5d8ee86c25-project-2.mp4` from ~48 MB to ~1.6 MB; removed unreferenced `ppt.mp4` (~82 MB).
- Added canonical routes, corrected Open Graph paths, robots/sitemap API routes, safe response headers, admin noindex/CSP, SVG favicons and an Apple touch icon.
- Admin input errors now return HTTP 400 instead of a generic server error. Added optional Upstash Redis login throttling; without Upstash, Vercel Firewall is recommended because in-memory throttling is only per function instance.
- Added Node API/static tests in `tests/` (run `node --test tests/*.test.js`).

## Safe upgrade of the existing repo

1. **Back up the existing GitHub repo or make a new Git branch.** Do not delete GitHub files you don't see in this ZIP, particularly `assets/uploads/`.
2. Extract this ZIP, and copy its **contents** into the repository root (not a second parent folder). Review changes before commit, preserving the original uploaded images listed below. The active GitHub branch is `main`.
3. In Vercel, use framework preset **Other**, root `./`, and leave Build/Output commands unset; the static pages and Node `/api/` functions deploy together.
4. Confirm required server-side secrets in **Vercel → Settings → Environment Variables**: `GITHUB_OWNER=siddo-web`, `GITHUB_REPO=portfolio`, `GITHUB_BRANCH=main`, `GITHUB_TOKEN` (repo Contents read/write), `ADMIN_PASSWORD` (12+ chars), `SESSION_SECRET` (32+ chars). Do not upload real secrets to GitHub.
5. Optionally set `SITE_URL=https://YOUR-REAL-DOMAIN` for stable sitemap/robots links, and run `SITE_URL=https://YOUR-REAL-DOMAIN node scripts/set-site-url.mjs` before committing to finalize Open Graph and canonical absolute URLs. If not run, canonical URLs use valid relative paths and the sitemap uses the request hostname.
6. Optionally configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to persist login throttling across serverless instances. Otherwise enable Vercel Firewall rate limits for `/api/admin?action=login`.
7. Redeploy, verify `/admin/` login, create/update a project, confirm media loads, check mobile views, test Jotform submission on your live site, and check `/sitemap.xml` and `/robots.txt`.

### Important: two images uploaded after the ZIP was created

The user's supplied ZIP did **not** contain these two GitHub files, but they exist in `siddo-web/portfolio` on the default branch:

- `assets/uploads/1793743026151-d9e3b1e9ff9544fb.webp`
- `assets/uploads/1793743028726-f1a5ddd138435ace.webp`

**Preserve them during Git merging or copy/download from the existing repo for a completely fresh deployment.** The CMS uses the original public repo URLs as image-loading fallbacks, so previews still work while files are available on GitHub. There are no credentials needed for those public media files. The draft record is preserved; it is not shown to visitors.

### Notes on Supabase Phase 2

The November 3–4 history has commits for a **Supabase Phase 2** implementation, but these commits were deliberately reverted on `main`. This package keeps the original GitHub-backed CMS so it works with existing Vercel settings; it does NOT silently activate Supabase or invent database credentials. If Supabase was set up already, its previous schema/auth must be integrated and tested separately before migration.

### What cannot be verified offline

Automated **11 Node tests passed** on this package. The sandbox blocks Chromium navigation, so actual live-browser/mobile visual checks and Jotform delivery were not verified. Test these on the Vercel preview/live domain after deployment.
