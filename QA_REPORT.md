# QA Report — Premium Profile Card & Responsive Typography

## Verified in local Chromium component fixture

- 390 × 844 mobile: loader visible at 17% after ~300ms, finishes at 100%; original 1061×1483 PNG displays uncut; click/tap flips; Close dismisses the overlay.
- 768 × 1024 tablet: same loader, image, flip and close tests pass.
- 1440 × 900 desktop: same loader, image, flip and close tests pass.
- Browser checks also verified the source image natural width is 1061 pixels and the card ratio is retained at each viewport.

## Typography smoke test

- Homepage and service cards checked at 390, 768 and 1440px using a static document fixture with linked local CSS inlined.
- No document-level horizontal scrolling at those widths.
- Service icon tile diameter: 56px on mobile; 62px on tablet and desktop.
- Heading sizes now have bounded minimums on mobile/tablet and a deliberate desktop maximum.

## Automated tests

- 20/20 repository tests pass with `node --test tests/*.test.js`.
- Main homepage JavaScript syntax validated via `node --check`.

## Limitations / scope

- The live Vercel URL could not be browsed from this environment, so screenshots and interaction tests are local reproductions rather than post-deployment Vercel tests.
- The front artwork is the exact image supplied, including its *old* five service labels baked into the image; these have **not** been replaced with CMS labels to avoid changing the reference artwork.
- Other site imagery and user-added project videos are unchanged.
- The connected GitHub repository is read-only for this assistant, so this ZIP is for the user's local VS Code/Git deployment.
