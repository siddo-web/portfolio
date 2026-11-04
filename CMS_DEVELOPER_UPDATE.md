> **SUPERSEDED:** This document describes an earlier login-enabled build. The current version has no website login. Follow `README.md` and `NO_LOGIN_SECURITY_UPDATE.md` instead.

# CMS Developer portfolio — restored original service pages

The five CMS services still display on the homepage, in the animated doors, service cards, menu and footer. All service links now open the original portfolio inner-page designs (instead of the generic new service layouts):

1. WordPress Development → `/webdev_portfolio/`
2. Shopify Development → `/UIUX_portfolio/`
3. Webflow & Wix Development → `/graphic/`
4. CMS Migration & Integrations → `/appdev_portfolio/`
5. CMS Support & Optimization → `/digital-marketing/`

**Design preserved:** All original inner-page CSS, card grids, stacked-card motion, monitor and phone mockups, videos, graphic work, hover effects and case-study media. Original project case studies are retained and are not falsely relabeled as WordPress or Shopify builds. The last page has the same six illustrative stacked cards with CMS-support-focused wording.

**Content changes:** Only the service titles, introductions, SEO descriptions, CMS-related CTA and service navigation labels were updated on the original layouts. The homepage hero wording and CMS service categories from the previous revision are retained.

The existing `/services/<slug>/` URLs redirect to the original layouts. `/admin/` still edits the service records in `content/services.json`. Editing service titles and summaries updates the original page headings, introductions, SEO snippets and menus on reload. The original case-study cards intentionally remain independent of service settings.

## Deploying in VS Code

Copy the extracted contents into the cloned repository root, preserving the `.git` folder and any existing local secrets (`.env`). Run `npm test` if available or `node --test tests/*.test.js`, then stage, commit and push. Do not upload the ZIP file itself to the repository.
