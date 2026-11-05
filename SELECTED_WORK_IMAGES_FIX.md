# Selected Work Images Fix — 5 November 2026

Base: `siddo-web/portfolio`, `main` at commit `499d8e6933a4644aa59c006c87b0ac905f517ffd`.

## Fixed

The `cms/public.js` image validator previously allowed only `assets/uploads/*.webp|jpg|png`, but the 30 published **Selected work.** entries refer to real images in `assets/images/project-screenshots/` and `assets/images/project-screenshots/placeholders/`.

The validator now safely accepts both project screenshot folders and the existing upload folder. It continues to reject absolute/external image URLs, traversal, and unexpected file types. Project cards and their full-size detail modal now use the proper local images. If an image later fails to load, the card shows a project-named local data-image preview rather than a blank/broken image. The public projects API and unpublished-content protections are unchanged.

All 30 current published project images are present in this ZIP, including named placeholders where real screenshots are not yet available.

## Latest GitHub edits preserved

The Webflow hanging-print CSS uses `object-fit: contain`, as in the current `main` branch. Only the CMS public renderer was changed (plus this guide and a regression test); existing layouts and projects are untouched.

## Deploy

Replace the repo contents with this full ZIP while **keeping `.git` and local `.env`**. Alternatively, copy only `cms/public.js` from this ZIP to the same path in your local repository (the full ZIP also contains all referenced images).

Run:

```bash
git status
git add -A
git commit -m "Fix Selected Work project images"
git push origin main
```

Vercel should deploy after push. Refresh the site with Ctrl+Shift+R. Verify the images under **PROJECT ARCHIVE / CURATED WORK** and open one project detail modal.

## Local test notes

Static checks validate paths, files and syntax, but a real Vercel browser test was not available in this execution environment (browser navigation blocked by administrator). A raw static server will not provide the `/api/projects` serverless route; use the deployed Vercel site to view this dynamic section.
