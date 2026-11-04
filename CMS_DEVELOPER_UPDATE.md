# CMS Developer Portfolio Update — November 4, 2026

## What changed

The homepage and five featured services now position Muhammad Siddique as a **CMS Developer**. The five service pages are:

1. WordPress Development (`/services/wordpress-development/`)
2. Shopify Development (`/services/shopify-development/`)
3. Webflow & Wix Development (`/services/webflow-wix-development/`)
4. CMS Migration & Integrations (`/services/cms-migration-integration/`)
5. CMS Support & Optimization (`/services/cms-support-optimization/`)

Each includes a hero introduction, included work, deliverables, process, platforms and tools, FAQs and project enquiry links. The homepage menus, animated doors, services cards, footer links and SEO copy now use this new positioning. Responsive styling is provided in `services/service.css`.

## Change all services through the CMS dashboard

1. Deploy the folder contents to the existing GitHub repository and Vercel project. **Keep your Vercel Environment Variables and existing GitHub files, including `assets/uploads/`.**
2. Visit `/admin/` on the deployed site and sign in using your existing admin password.
3. Select **CMS services** in the sidebar. Click **Edit content** on any of the five services.
4. Update titles, short labels, taglines, summaries, introductions, inclusion lists, deliverables, steps, tools and FAQs, then click **Save service**.
5. The CMS commits the changes to `content/services.json` on GitHub. Vercel redeploys on the repository update. Reload the live site after deployment.

Service URLs/slugs remain fixed when editing: this avoids broken links, but renaming a service's URL requires a code edit and redirect. The service pages include the initial content in HTML as a fallback; subsequent CMS edits appear through JavaScript from `content/services.json`. For the strongest SEO, update the service page's static metadata as well when making permanent, substantial changes to its title/description.

## Existing projects preserved

The old `/webdev_portfolio/`, `/UIUX_portfolio/`, `/graphic/`, `/appdev_portfolio/` and `/digital-marketing/` page files were **not removed**. They are kept as legacy project examples, but removed from the main Services navigation. Existing data in `content/projects.json` was retained. New projects can be categorized under the CMS services, while historical category labels remain available in the project editor so existing records are not silently recategorized.

## Website stack and deployment

This is the existing static HTML/CSS/JavaScript portfolio with a **GitHub-backed Vercel CMS**, not WordPress or PHP. No migration of the deployed site's underlying framework was made. The five new page routes are static directories; all files should be uploaded to the **repository root** alongside the existing `index.html`, `api/`, `admin/` and `content/` directories.

The existing Jotform enquiry form URL was retained. Test a real enquiry submission on the deployed domain. If you deploy on a different domain, use `SITE_URL=https://your-real-domain node scripts/set-site-url.mjs` to finalize canonical and Open Graph URLs, then commit those changes. Do not commit any GitHub token or admin credentials.

## Verification

`node --test tests/*.test.js` runs 13 automated API, CMS and static checks, including service updates. The service names, local links and HTML structure were also checked. Full interactive desktop/mobile visual review and live Jotform delivery could not be verified in the sandbox; test them on the deployed site before publishing.
