# Portfolio cleanup and screenshot update

## What was changed

- Removed the obsolete capture-generated README files, manifests, cached source pages, and browser URL-rewriting shims from the old imported portfolios.
- Removed references to the previous portfolio owner's name and domain from HTML, CSS, JS, and JSON. Muhammad Siddique's own copyright/footer is preserved.
- Removed old copied demo videos and unrelated project posters from the visible WordPress, Shopify and Other CMS project galleries. Those items now show supplied screenshots where available, otherwise honest media-pending artwork.
- Preserved the existing page designs, navigation, sticky cards, responsive styles, profile card, and Vercel SEO redirects.
- The uploaded ZIP included no `.git/` directory in this export. Keep your own repo's `.git` directory when copying.

## 14 real screenshots found in the uploaded `site-placeholders` folder

All fourteen source images were optimized and included under `assets/images/project-screenshots/`:

1. Hollywood Associates — Wix
2. Greater Gain Group — Webflow
3. Art & Industry Inc. — WordPress
4. SXS Parts USA — Shopify
5. William H. Thielen — WordPress
6. Tikuya Travels — WordPress
7. OE Machine Company — WordPress
8. Reags Reviews — WordPress
9. Deviant Apple Inc. — Other CMS / Squarespace
10. Nolan Wells Studios — Other CMS / Format
11. SRNY — Webflow
12. IES — WordPress
13. Naomi Amram Design — WordPress
14. B10.life — WordPress

The Webflow gallery also has 4 properly labelled *designed preview variants* made with the actual supplied screenshots, not unrelated art.

## Websites with no screenshot in the ZIP

For live websites still lacking an owner-supplied screenshot, a lazy screenshot request is made through `image.thum.io` when their project card approaches the screen. If that service is blocked, down, or its quota is exhausted, the existing labelled local placeholder remains. **These are not static screenshots bundled into the ZIP.** The screenshot service is third-party and will receive a request from visitors whose browsers load these images.

To bundle real screenshots locally instead, use a machine with web access:

```sh
pip install playwright pillow beautifulsoup4
python -m playwright install chromium
python scripts/capture_remaining_screenshots.py
```

The script saves local WebP screenshots only for reachable sites, updates the corresponding static HTML and JavaScript project records and refreshes the Vercel inline-script CSP hashes. Re-run `node --test tests/*.js` afterward. Some sites may reject automated screenshot browsers; they will keep their existing fallback in that case.

For Webflow's Siddique personal portfolio, the supplied ZIP did not have a matching screenshot. It still has an honest pending image while the other Webflow sites use real owner-supplied captures.

## Deployment

1. Extract the ZIP and copy its contents over your existing Git checkout, without deleting `.git` or your local environment variables.
2. **Delete obsolete files** in the previous checkout that are no longer in this package; merely copying files cannot remove old capture manifests or cached source pages. In VS Code, `git status` shows removed/changed files.
3. Run `node --test tests/*.js` to check your copy.
4. Run `git add -A`, commit, and push. Validate on Vercel after deployment; the local browser in the build environment could not open even localhost pages for visual QA.
5. Replace remaining fallback media with screenshots or your own video recordings when available. Use only project imagery you have permission to publish.

Avoid removing legally required third-party license or image-credit notices from assets you continue to distribute. The cleanup removes obsolete source-capture artifacts, not the owner's own legal copyright statement.
