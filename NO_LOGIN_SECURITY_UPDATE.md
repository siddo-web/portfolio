# No-login security update (2026-11-05)

- Removed `admin/` login interface.
- Replaced former `api/admin.js` with nonfunctional HTTP 410 tombstone so older privileged code is overwritten in copy-based deployment.
- Added `/admin` redirects and `.vercelignore` exclusion as defense against leftover files.
- Removed `GITHUB_TOKEN`, `ADMIN_PASSWORD`, `SESSION_SECRET` and Redis prompts from the current setup instructions.
- Converted `content/projects.json` to **30 published projects only**. Exported **19 drafts** to a *separate downloadable JSON backup*, not the site ZIP.
- Fixed public API output to retain `published: true` so public CMS cards display normally.
- Service labels are edited in `content/services.json`; project cards in `content/projects.json`. No website login required.

**Deployment warning:** You must remove the already-tracked `admin/` folder from GitHub (`git rm -r admin`) since copying a ZIP over existing folders does not delete stale files. Also check old Git commit history.
