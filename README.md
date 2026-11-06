# Muhammad Siddique — Developer Portfolio

Production source for the existing Muhammad Siddique portfolio, updated 6 November 2026. This release preserves the original site's visual identity, editorial styling, animated service doors, profile card and Jotform contact flow. It replaces hardcoded project grids with one catalog and five scoped service collections.

## Start locally

Requirements: **Python 3** (for the simplest local static server) and **Node.js 18 or later** (only for the optional automated tests). There are **no npm dependencies, package installs, paid services, build/bundling steps, or `node_modules`** in this project.

From the directory containing `index.html`:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/`. Don't open the HTML pages through `file://`: the project catalog is fetched over HTTP. A plain local HTTP server serves `content/projects.json`; on Vercel the primary source is `/api/projects`.

Run the test suite:

```sh
node --test tests/*.test.js
```

The suite checks published project identity, five-category isolation, URL and image safety, interactive filter/search/pagination behavior, services, security/CSP, redirects and active assets.

## Deploy to Vercel

1. Extract the ZIP **contents** to the repository's **root** (`index.html`, `vercel.json`, `api/`, `content/`, `assets/`, etc. should be at the root, not inside a second wrapper folder).
2. If updating an existing GitHub repository, preserve its `.git` folder. Copy the new files over the old working tree; delete obsolete legacy website folders that no longer appear in this release if the repository still tracks them.
3. In Vercel, keep the existing project and connect or update that repository. Use the **Other** framework preset, root directory `./`, leave **Build Command** and **Output Directory** empty/unset. Do not install dependencies; Vercel will serve the static pages and build the Node serverless `/api` handlers.
4. Set the optional `SITE_URL` environment variable to your site's final HTTPS origin (e.g. `https://example.com`). Default SEO metadata still references the previously configured `https://siddique-profile.vercel.app`. If changing domains, use the script below and commit the generated meta changes.
5. Deploy, then verify the homepage, service-page routes and `/selected-sites/`, the project categories, internal anchors, external links and Jotform enquiry flow on a real desktop and mobile browser.

Existing `vercel.json` handles API rewrites, redirects and security headers. `.vercelignore` excludes local import/QA files from static hosting. The public API is **read-only**, without an admin login. `api/admin.js` intentionally returns HTTP 410 for the retired admin API.

## Site structure and navigation

Homepage sequence: **Home → About → Services → Projects → Skills → Contact**. The original interactive door showcase and process sections remain available below the primary content. Five service pages have their own project collections:

| Service | Route | Published website cards | Separate component/workflow entries |
| --- | --- | ---: | ---: |
| WordPress Development | `/wordpress/` | 8 | 6 |
| Shopify Development | `/shopify/` | 1 | 6 |
| Webflow Development | `/webflow/` | 3 | 0 |
| Wix Development | `/wix/` | 1 | 0 |
| Other CMS & Integrations | `/other-cms/` | 4 | 4 |

The homepage **All websites** filter shows just these 17 platform-identified website cards. The separate `/selected-sites/` directory shows 35 supplied website references whose CMS **and/or exact project contribution remain unconfirmed**. They are not assigned to a service by guesswork. These published references are not a claim of independently verified client delivery. Workflows and technical components are identified as such rather than presented as separate completed websites.

## Project catalog and editing

- `content/projects.json` — **68 public catalog records**: 17 website cards in the five service categories, 16 technical/component or workflow records on service pages, plus 35 platform-unconfirmed website references in their separate archive.
- `content/project-source.csv` — source CSV containing the full set of **76** unique project records, including the supplied titles, links and verification notes.
- `content/review-queue.json` — **8 unpublished or pending-review** records (concepts, examples, or entries without an approved link). Preserved so no source item is lost; excluded from Vercel hosting via `.vercelignore`.
- `content/services.json` — headings and descriptive service content.
- `cms/public.js` and `cms/public.css` — shared frontend rendering, five filtering tabs, search, pagination, project dialogs and component/workflow sections.
- `scripts/build-project-catalog.py` — optional CSV reimport tool. It matches existing entries conservatively by canonicalized URL, title and high-confidence similarity, and retains existing real screenshots where matched. Make a backup before reimporting edited project data.

**To add or edit a public project:** edit `content/projects.json`, preserving an unused `id`, a category (`wordpress`, `shopify`, `webflow`, `wix`, `other-cms`, or `unverified`), `kind` (`website`, `personal`, `component`, or `workflow`), and `published: true`. Populate `title`, `summary`, `description`, `url` (an HTTPS website URL) and optionally `image` (an existing local screenshot). Use `verification`/`sourceNote` to record what is and isn't independently confirmed. To add a new service-page website, assign a verified platform and `kind: "website"`. To add an unconfirmed website, use `category: "unverified"`—it will appear only in `/selected-sites/`. For a component or workflow, use the corresponding `kind`: it will be labeled and rendered separately. Do **not** invent a screenshot or infer a CMS from a site's appearance.

The published API (`api/projects.js`) reads `content/projects.json`. The UI uses that API on Vercel and falls back to the local JSON file in simple static-server mode. After changes, run the tests and deploy.

The supplied CSV records and website links were preserved and syntax-checked, but **external sites were not all confirmed live, and project ownership or contributions have not been independently verified**. Check each link and contribution before describing it as a finished client project. The pending-review files may include internal notes: **do not publish those files to a public repository** without reviewing or relocating them. Vercel's `.vercelignore` prevents static deployment but does **not** hide source files committed to public GitHub.

## Metadata and security

Update canonical and Open Graph links for a custom domain with:

```sh
SITE_URL=https://your-domain.example node scripts/set-site-url.mjs
python scripts/refresh-csp.py
node --test tests/*.test.js
```

If you edit inline JavaScript in any HTML file, regenerate the Content-Security-Policy script hashes using `python scripts/refresh-csp.py` before deploying. Keep the current `vercel.json` security headers. Do not put API secrets, account credentials, or private client records in frontend files.

The existing enquiry form is loaded through Jotform at `https://form.jotform.com/263056967949073`, and a direct link is provided if it cannot be embedded. Verify the form and its notification settings in your own Jotform account.

## Verification status for this release

**Passed:** 40 automated Node tests; project uniqueness/category/API checks; local image existence; HTML/CSS/JS relative assets; content security hashes and redirects. Native screenshot-based visual QA could not be run here because the available Chromium browser is managed by a policy blocking navigation, including to `localhost`. Consequently, desktop/mobile visual results and external URL reachability still require a real-browser check after deployment.

See `PROJECT_AUDIT.md` for the consolidated inventory, QA scope and outstanding content-verification tasks.
