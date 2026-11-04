## Latest update — screenshots and capture cleanup

See `SCREENSHOTS_AND_CLEANUP.md` for the exact list of 14 real attached screenshots, site screenshot fallbacks, and instructions for capturing remaining live screenshots locally. The obsolete capture-generated source metadata and old sample video artwork were removed.

# Muhammad Siddique — Public CMS Developer Portfolio (No Login)

This is a publicly viewable HTML/CSS/JavaScript portfolio deployed on Vercel. **There is no website login, admin dashboard or GitHub write API.** The former `/admin/` route redirects home and the deprecated `/api/admin` endpoint responds HTTP 410 without any authentication or write capabilities.

## Editing your work

Update the project entries directly in `content/projects.json` (published projects only) or service copy in `content/services.json`. Commit and push to the GitHub repository; Vercel redeploys automatically. Media can be replaced in the corresponding portfolio assets. Existing responsive design, gallery cards, profile-card loader, and Jotform enquiry popup remain intact.

**Do not commit unpublished project details, client credentials, GitHub tokens or other secrets.** Previously unpublished draft entries have been exported to a separate backup file that must **not** be pushed to a public repository. Older GitHub commits may still contain them.

## Safe rollout from an earlier version

1. Extract and copy the **contents** of this ZIP into the repository root, preserving `.git` and your local `.env` if any.
2. Remove the now-unnecessary old `admin/` folder from the local repository. Deleting via VS Code Explorer works; or run `git rm -r admin` where that folder is currently tracked. Keep `api/admin.js` from this release, as a harmless HTTP 410 retirement handler.
3. Run `git status` and confirm the old `admin/` files are deleted before `git add -A` and `git commit`.
4. Check GitHub repository access and Vercel project permissions. Public repositories reveal frontend source and older commit history.
5. Deploy and verify `/admin/` no longer opens a login, `/api/admin` does not allow login or edits, `/api/projects` still shows published work, and all portfolio pages work.

No `GITHUB_TOKEN`, `ADMIN_PASSWORD`, `SESSION_SECRET` or Redis login-rate-limit variables are required for this release. If you previously configured those solely for the old portfolio admin, revoke the GitHub token and remove those values from Vercel after confirming no other service uses them.

## Hosting and tests

- Vercel preset: Other. Root: repository root.
- `SITE_URL` is optional for generating sitemap/robots origin; no login credentials required.
- Enquiry form is embedded through Jotform; submissions go to Jotform, not this site's APIs.
- Run `node --test tests/*.test.js` from repository root to test locally.
- CSP hashes: after changing inline scripts in HTML run `python scripts/refresh-csp.py`.

See `SECURITY_DEPLOYMENT_GUIDE.md`, `NO_LOGIN_SECURITY_UPDATE.md` and `DUPLICATES_REMOVED.md`. Older historical notes can refer to earlier CMS versions and are superseded for login/security questions.
