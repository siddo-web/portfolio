# Premium Profile Card & Responsive Type Update

## Premium Profile Card
- Front face uses the EXACT uploaded PNG at `assets/images/muhammad-siddique-premium-profile.png` (1061x1483), without cropping or rebuilding its artwork.
- Original custom portrait, gold ornamentation, text and service list are part of the image and therefore remain exactly as in your reference. If you want the five services shown on the image changed to CMS specializations, provide an updated image or editable artwork.
- Loader has been restored: 0% to 100%, an actual image-ready check, a 4.2-second cap, and no dependency on the missing `/ability-card/` iframe.
- The reverse CSS card, mouse tilt, tap to flip, Escape/Close, and keyboard accessibility remain available.

## Type & Icons
- New `styles/portfolio-polish.css` controls a consistent responsive type hierarchy and reduces oversized decorative icons while protecting the existing page layouts.
- Included in homepage and all five original inner service/project pages.
- Existing CMS content, original cards and videos remain unchanged.

## Deploy
1. Extract ZIP, copy contents into your working Git repository; do not replace `.git` or local `.env`.
2. `git status`, `git add -A`, `git commit -m "Restore original premium card and balance typography"`, `git push origin main`.
3. Check homepage (including card loader/flip) and inner projects on desktop and mobile. Hard-refresh after deployment.

## Notes
- The source attachment itself contains older service labels (Web Development, Web Design, Design & Brand, App Development and Digital Marketing). These are baked into the pixels and were intentionally not modified to honour the exact match request.
- Live Vercel inspection is unavailable from this tool environment; changes are based on the repo-backed prior ZIP and static/browser component tests.
