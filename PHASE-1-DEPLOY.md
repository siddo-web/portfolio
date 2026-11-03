# Phase 1 — Portfolio CMS stabilization (November 4, 2026)

This is the **GitHub + Vercel** version of Muhammad Siddique's portfolio. Phase 1 does **not** move to Supabase or add full page editing. Those are later phases. Original website design, portfolio demo pages and Jotform integration remain intact.

## Important: which files to upload?

- **Phase 1 patch ZIP:** update your existing `siddo-web/portfolio` GitHub repository with only the changed files, preserving the same paths. Recommended if the website is already live. Keep all existing project assets and content.
- **Phase 1 full ZIP:** a clean copy of the entire static site for a fresh clone or local backup. Extract the CONTENTS to the repository root (not into another parent folder). It intentionally excludes `.git` and the accidental duplicate website directory in the uploaded archive. Contains large existing videos.
- Neither package contains real credentials. Do not upload `.env` or access tokens to GitHub.

## Required Vercel settings

Vercel → Portfolio project → **Settings → Environment Variables**:

| Variable | Example / instructions |
| --- | --- |
| `GITHUB_OWNER` | `siddo-web` |
| `GITHUB_REPO` | `portfolio` |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_TOKEN` | Fine-grained GitHub personal access token scoped ONLY to this repository, **Contents: Read and write** |
| `ADMIN_PASSWORD` | A unique password of 12–512 characters; do **not** put it in GitHub |
| `SESSION_SECRET` | Random 32+ character secret; do **not** put it in GitHub |

Generate `SESSION_SECRET` on your own system with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

Make sure Vercel deploys the **main** branch with **Framework Preset: Other**, **Root Directory: ./** and **no static build command/output directory**. After saving env settings, redeploy. Any file update to `content/projects.json` or `assets/uploads/` from the CMS commits to GitHub; Vercel should then automatically redeploy.

**Admin URL:** `https://portfolio-onyx-digital1.vercel.app/admin/`

Sign in with the `ADMIN_PASSWORD` environment variable. This phase deliberately keeps the existing single-password admin login; email/password accounts and a database are planned for Phase 2.

## Smoke test after deploy

1. Open `/admin/`. Check that the sign-in screen appears; sign in with the configured password.
2. Add a new test project as **Draft** and save. Confirm it appears in the dashboard.
3. Edit the project, attach a JPEG/PNG/WebP cover image, select **Featured**, mark **Publish on website**, then save.
4. In GitHub confirm a new commit to `content/projects.json` and (for uploads) `assets/uploads/`; wait for Vercel deployment to reach Ready, then refresh the live website and relevant service portfolio.
5. Verify the project detail dialog, image and external link. Edit then delete the test project, and confirm the public site updates after the next deploy.
6. Sign out, then verify a protected API endpoint returns an unauthorized response. Test a Jotform enquiry independently via the form owner account.

If the CMS says "not configured", verify all six environment variables and redeploy. If it says "GitHub access denied", check the fine-grained token's repo selection, **Contents** permission and token expiry. If it says "GitHub repository or project file not found", ensure the branch and `content/projects.json` exist.

## Changes included

- Removed accidental nested duplicate project and embedded Git history from the distribution.
- Protected against treating missing GitHub projects data as an empty library.
- Improved API validation/error responses for invalid records, API methods and GitHub failures.
- Tightened same-origin checks; made admin sessions invalid after `ADMIN_PASSWORD` changes; retained HTTP-only, SameSite-Strict cookies.
- Made unsuccessful logout display an error rather than falsely reporting sign-out.
- Added editor upload/saving guards and a client-side source image size/type check.
- Prioritized **Featured** records in the CMS public Selected Work sections and made their status visible in the admin library.
- Set admin/API security/no-cache headers without changing the public site's existing scripts.
- Added automated API regression tests runnable with `node --test tests/admin-api.test.js` (Node 20+).

## Current limitations / Phase 2 work

- Admin has **one password**, not a database user system. The simple login throttle is **per Vercel function instance**, not globally persistent. Configure Vercel Firewall/rate limiting; use a long, unique password.
- Projects are stored by commits to `content/projects.json` in GitHub, not a real-time database. Updates appear after Vercel redeploys.
- **Draft data is not private** in a public GitHub repository or public JSON URL. Draft only hides a project from the frontend display. Do not store confidential content.
- Existing, hardcoded portfolio cases and other page text are still not editable through the CMS. Migrating them is scheduled for later phases.
- Jotform submissions are managed in Jotform, not through this dashboard.
- Image uploads are limited to 2 MB each *after compression*. Uploads create their own GitHub commits; interruptions may leave an unused image file.
- Tests use a mocked GitHub API. They do not prove actual Vercel secrets, permission grants, hook redeploys or Jotform email notifications work in production. Complete the smoke test above once deployed.
