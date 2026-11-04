# Project image replacement guide

All service-page project cards now use LOCAL WebP images. No project relies on a third-party screenshot service or on a blank HTML box.

**Supplied screenshot files retained:** 18 (includes Webflow gallery crops).  
**Named placeholders generated:** 49.

## How to replace a placeholder

1. Find your project below by name. Open the corresponding file under `assets/images/project-screenshots/placeholders/`.
2. Export your actual project screenshot at **1600 × 1000 px** as **WebP**. (The original card aspect ratio is 16:10.)
3. Replace that file **without changing its filename**. All cards are already connected to it. For different media dimensions, resize/crop to 16:10 to avoid layout changes.
4. For a supplied screenshot, replace the file directly under `assets/images/project-screenshots/` instead.
5. In VS Code run `git add -A`, commit, push; hard-refresh Vercel after deployment. The Webflow print gallery and sticky cards use named local files too.

## Named placeholders

| Service | Project | Replace this file |
|---|---|---|
| shopify | Mardoo Scrubs | `assets/images/project-screenshots/placeholders/shopify-mardoo-scrubs.webp` |
| shopify | Featured Products Grid | `assets/images/project-screenshots/placeholders/shopify-featured-products-grid.webp` |
| shopify | Palace Product Template | `assets/images/project-screenshots/placeholders/shopify-palace-product-template.webp` |
| shopify | CTM Product Cards | `assets/images/project-screenshots/placeholders/shopify-ctm-product-cards.webp` |
| shopify | Ezzi Arts & Frames | `assets/images/project-screenshots/placeholders/shopify-ezzi-arts-frames.webp` |
| shopify | DS Shop Grid | `assets/images/project-screenshots/placeholders/shopify-ds-shop-grid.webp` |
| shopify | Shopify Brand Logos Grid (Dynamic Count) | `assets/images/project-screenshots/placeholders/shopify-shopify-brand-logos-grid-dynamic-count.webp` |
| wix | Steph Saffer | `assets/images/project-screenshots/placeholders/wix-steph-saffer.webp` |
| wix | Heroes of Tomorrow Africa | `assets/images/project-screenshots/placeholders/wix-heroes-of-tomorrow-africa.webp` |
| wix | Wix — Services Website | `assets/images/project-screenshots/placeholders/wix-wix-services-website.webp` |
| wix | Wix — Small Business Homepage | `assets/images/project-screenshots/placeholders/wix-wix-small-business-homepage.webp` |
| wix | Wix — Portfolio Collections | `assets/images/project-screenshots/placeholders/wix-wix-portfolio-collections.webp` |
| wix | Wix — Blog & Journal | `assets/images/project-screenshots/placeholders/wix-wix-blog-journal.webp` |
| wix | Wix — Appointment Landing Page | `assets/images/project-screenshots/placeholders/wix-wix-appointment-landing-page.webp` |
| wix | Wix — Events Website | `assets/images/project-screenshots/placeholders/wix-wix-events-website.webp` |
| wix | Wix — Nonprofit Content Hub | `assets/images/project-screenshots/placeholders/wix-wix-nonprofit-content-hub.webp` |
| wix | Wix — Gallery Experience | `assets/images/project-screenshots/placeholders/wix-wix-gallery-experience.webp` |
| wix | Wix — Site SEO Cleanup | `assets/images/project-screenshots/placeholders/wix-wix-site-seo-cleanup.webp` |
| other-cms | WooCommerce to Shopify Migration | `assets/images/project-screenshots/placeholders/other-cms-woocommerce-to-shopify-migration.webp` |
| other-cms | OnyxDigital — Admin CMS | `assets/images/project-screenshots/placeholders/other-cms-onyxdigital-admin-cms.webp` |
| other-cms | HYRA — Cortisol Balancing Drink Mix | `assets/images/project-screenshots/placeholders/other-cms-hyra-cortisol-balancing-drink-mix.webp` |
| other-cms | Elementor Sticky Header | `assets/images/project-screenshots/placeholders/other-cms-elementor-sticky-header.webp` |
| other-cms | Dual-Phone Mockup Slider | `assets/images/project-screenshots/placeholders/other-cms-dual-phone-mockup-slider.webp` |
| other-cms | WordPress Content Handover | `assets/images/project-screenshots/placeholders/other-cms-wordpress-content-handover.webp` |
| selected-sites | School of Imagination | `assets/images/project-screenshots/placeholders/selected-sites-school-of-imagination.webp` |
| selected-sites | United Way of Florence County | `assets/images/project-screenshots/placeholders/selected-sites-united-way-of-florence-county.webp` |
| selected-sites | Elie Design FL | `assets/images/project-screenshots/placeholders/selected-sites-elie-design-fl.webp` |
| selected-sites | Boston Custom Signs | `assets/images/project-screenshots/placeholders/selected-sites-boston-custom-signs.webp` |
| selected-sites | Cambiar | `assets/images/project-screenshots/placeholders/selected-sites-cambiar.webp` |
| selected-sites | Swanky Home Pros | `assets/images/project-screenshots/placeholders/selected-sites-swanky-home-pros.webp` |
| selected-sites | Greenberg Psychology | `assets/images/project-screenshots/placeholders/selected-sites-greenberg-psychology.webp` |
| selected-sites | RNL Realty | `assets/images/project-screenshots/placeholders/selected-sites-rnl-realty.webp` |
| selected-sites | Kaanthaa | `assets/images/project-screenshots/placeholders/selected-sites-kaanthaa.webp` |
| selected-sites | Adorn Marmor | `assets/images/project-screenshots/placeholders/selected-sites-adorn-marmor.webp` |
| selected-sites | Lisa Even | `assets/images/project-screenshots/placeholders/selected-sites-lisa-even.webp` |
| selected-sites | SmartLife Foundation | `assets/images/project-screenshots/placeholders/selected-sites-smartlife-foundation.webp` |
| selected-sites | TENFOLD | `assets/images/project-screenshots/placeholders/selected-sites-tenfold.webp` |
| selected-sites | Please Paulo Stop Cappin | `assets/images/project-screenshots/placeholders/selected-sites-please-paulo-stop-cappin.webp` |
| webflow | Siddique — Webflow Portfolio | `assets/images/project-screenshots/placeholders/webflow-siddique-webflow-portfolio.webp` |
| webflow | Webflow CMS — Project Collection | `assets/images/project-screenshots/placeholders/webflow-webflow-cms-project-collection.webp` |
| webflow | Webflow — Editorial Journal | `assets/images/project-screenshots/placeholders/webflow-webflow-editorial-journal.webp` |
| webflow | Webflow — Services Landing Pages | `assets/images/project-screenshots/placeholders/webflow-webflow-services-landing-pages.webp` |
| webflow | Webflow — Studio Portfolio | `assets/images/project-screenshots/placeholders/webflow-webflow-studio-portfolio.webp` |
| webflow | Webflow — Team Directory | `assets/images/project-screenshots/placeholders/webflow-webflow-team-directory.webp` |
| webflow | Webflow — Resource Library | `assets/images/project-screenshots/placeholders/webflow-webflow-resource-library.webp` |
| webflow | Webflow — Case Study Template | `assets/images/project-screenshots/placeholders/webflow-webflow-case-study-template.webp` |
| webflow | Webflow — Events Calendar | `assets/images/project-screenshots/placeholders/webflow-webflow-events-calendar.webp` |
| webflow | Webflow — CMS SEO Structure | `assets/images/project-screenshots/placeholders/webflow-webflow-cms-seo-structure.webp` |
| webflow | Webflow — Responsive Interactions | `assets/images/project-screenshots/placeholders/webflow-webflow-responsive-interactions.webp` |

## Existing screenshots

These files were supplied with your ZIP and are left untouched. You may overwrite them with newer screenshots as needed.

- `assets/images/project-screenshots/art-industry-inc.webp`
- `assets/images/project-screenshots/b10-life.webp`
- `assets/images/project-screenshots/deviant-apple-inc.webp`
- `assets/images/project-screenshots/greater-gain-group-gallery-1.webp`
- `assets/images/project-screenshots/greater-gain-group-gallery-2.webp`
- `assets/images/project-screenshots/greater-gain-group.webp`
- `assets/images/project-screenshots/hollywood-associates.webp`
- `assets/images/project-screenshots/ies.webp`
- `assets/images/project-screenshots/naomi-amram-design.webp`
- `assets/images/project-screenshots/nolan-wells-studios.webp`
- `assets/images/project-screenshots/oe-machine-company.webp`
- `assets/images/project-screenshots/reags-reviews.webp`
- `assets/images/project-screenshots/srny-gallery-1.webp`
- `assets/images/project-screenshots/srny-gallery-2.webp`
- `assets/images/project-screenshots/srny.webp`
- `assets/images/project-screenshots/sxs-parts-usa.webp`
- `assets/images/project-screenshots/tikuya-travels.webp`
- `assets/images/project-screenshots/william-h-thielen.webp`

## Notes

Some items in the portfolio are **example briefs** rather than completed client projects. Their placeholder images are explicitly marked as pending media and do not invent client screenshots.
The website layout, project titles, links, profile card, menu and existing SEO structure have not been redesigned.
