# Security & deployment guide — no-login edition

## What is removed

- Login form, admin dashboard and all privileged GitHub editing code removed.
- The former `/api/admin` is a stateless 410 response with **no GitHub token, authentication or write code**. This explicitly overrides an old API when users replace files in-place.
- Vercel redirects `/admin/` and descendants to `/`; `.vercelignore` excludes old admin folder remnants.
- The production project JSON includes **published items only**; unpublished drafts are supplied separately as a private backup and should not be uploaded to a public repository.

## Protections retained

- Sitewide content security policy and browser security headers in `vercel.json`.
- Public `/api/projects` supports GET only and exposes only published projects; no write functionality.
- XML sitemap and robots endpoints use a safe configured/fixed origin; they do not trust Host.
- Client-side display of dynamic project text avoids injecting untrusted HTML.
- Jotform form stays on the third-party provider.

## Deployment checklist

1. Delete the old tracked `admin/` folder in your Git checkout. Merely pasting extracted files does not delete old files.
2. Copy this release's files, keeping `.git` unchanged. Commit deletions and edits to GitHub.
3. On Vercel, verify `/admin/` does not display old UI, `/api/admin` returns 410, `/api/projects` responds with public projects, and card/project interactions still work.
4. Verify response CSP and check DevTools Console for blocked assets, including the Jotform iframe.
5. If old admin secrets still exist in Vercel, remove `GITHUB_TOKEN`, `ADMIN_PASSWORD`, `SESSION_SECRET`, and login-specific Redis credentials only when no other application needs them; revoke any GitHub token that is no longer needed.
6. Consider making the GitHub repo private if you do not want your entire source code and commit history downloaded. A private repo does **not** hide browser-delivered HTML, CSS, JS or image assets.
7. Inspect Git history for secrets or draft data previously committed. Deleting a file in the latest commit does **not** erase its older versions from history; confidential material may need history removal and credential rotation.

There is no browser-side technique that makes publicly delivered frontend source impossible to inspect or copy.
