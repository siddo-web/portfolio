# Own-site content update (4 November 2026)

The original scrolling cards, pinned galleries, media slots, animations and mobile layouts are retained. Only their project copy, project links and accessibility descriptions were updated from `Siddique_Fiverr_Project_Master_List_Updated_v3.xlsx`.

## Where to edit text
- WordPress cards: `webdev_portfolio/index.html`
- Shopify cards: `UIUX_portfolio/index.html`
- Webflow/Wix and selected website cards: `graphic/index.html`
- CMS migrations and integrations: `appdev_portfolio/index.html`
- CMS support stacked cards: the `PROJECTS` JavaScript array in `digital-marketing/index.html`
- Homepage published project cards: `content/projects.json` (or `/admin/` after deployment)
- Service descriptions managed through the admin: `content/services.json`

## Video and screenshot replacements
The existing older media files are **temporary sample visuals, not evidence or recordings of the newly described client projects**. Replace these before using this portfolio publicly as verified project media:
- WordPress: `webdev_portfolio/assets/media/` and `assets/images/`
- Shopify: `UIUX_portfolio/assets/media/` and `assets/images/`
- Webflow/Wix: `graphic/assets/images/`
- CMS migration: `appdev_portfolio/assets/media/` and `assets/images/`
- CMS support: `digital-marketing/assets/visuals/` (illustrative SVGs)

To replace a media source, update the `src` or `poster` in the corresponding page. Keep the existing CSS classes, wrapper and `video` attributes so scrolling/stack animations continue to work. To add homepage project cover photos, upload the images through `/admin/`. Cards without an image currently use the site's existing neutral numbered placeholder.

## Verification notes
The uploaded inventory explicitly says some older sites and contribution details require confirmation. Therefore, items without a verified platform are labelled 'Selected website' rather than WordPress, Wix or Shopify. There are no invented conversion figures or delivery dates. The Mardoo Scrubs item is labelled a storefront **concept**, not a launched Shopify store. Some entries have no live URL, so those cards don't show a visit link.

## Deployment
Unzip the archive, copy its **contents** to the existing local Git repository (keep `.git`, `.env` and any private credentials untouched), check `git status`, then commit and push the changes.
