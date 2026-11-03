# Phase 2 — Supabase database and secure admin login

**Project:** siddo-web/portfolio → Vercel. Built November 4, 2026. This release keeps every existing page, design, animation, Jotform integration and the Phase 1 GitHub CMS intact. The switch to Supabase is **explicit**: `CMS_BACKEND=supabase`. Until the switch, the old password login works as before.

## Files delivered

- `api/admin.js`: Backend switch; existing GitHub API preserved.
- `api/supabase-admin.js`: Supabase Auth sign-in, refresh, logout, reset, projects and image uploads.
- `api/projects.js`: Published projects API (published only, no drafts).
- `lib/supabase.js`: Server-only Supabase REST client and validation.
- `supabase/PHASE-2-SETUP.sql`: Database schema, RLS and public media bucket.
- `admin/index.html`, `admin/admin.js`, `admin/admin.css`, `admin/reset.html`, `admin/reset.js`: Admin UI and recovery.
- `cms/public.js`: Public project cards read `/api/projects` (not raw project JSON).
- `vercel.json`: CSP allows images from project Supabase domain.
- `tests/supabase-api.test.js`: Automated API tests, no real credentials used.

## Recommended: use PATCH ZIP

Extract the **Phase 2 PATCH** and upload its contents to the existing GitHub repository **root**, preserving all paths. This won't overwrite `content/projects.json`, media or your original HTML pages. Do NOT upload the folder itself as an extra directory. The FULL ZIP is a full backup/replacement only. Preserve any user-created files changed since the export.

### Step 1 — Create Supabase project

1. Go to https://supabase.com/dashboard and create a project in your organization.
2. Save its **Project URL**, **Publishable key** (`sb_publishable_...`) and **Secret key** (`sb_secret_...`) from Project Settings → API Keys / Connect.
3. Never paste secret keys into GitHub source code, screenshots, or public chat. Use Vercel environment variables only.

### Step 2 — Database setup

1. Supabase → SQL Editor → New Query; paste `supabase/PHASE-2-SETUP.sql`; run it.
2. Verify the `portfolio_projects` and `cms_admins` tables exist. The `portfolio-media` bucket should be **Public** (portfolio images only).
3. Authentication → Users → Add user; create an administrator email/password **with email confirmed**. Public self-signup is not needed and should be disabled if you only want one admin.
4. Run this *second* SQL statement, replacing the email:

```sql
insert into public.cms_admins (user_id)
select id from auth.users
where lower(email) = lower('YOUR-ADMIN-EMAIL@example.com')
on conflict (user_id) do nothing;
```

5. Verify **1 row** appears in `cms_admins` and its UUID matches Authentication → Users. `cms_admins` membership and the email allowlist in Vercel are BOTH required to sign in.

### Step 3 — Vercel Environment Variables

Add the following in your Vercel project under Settings → Environment Variables, Production:

| Key | Value |
| --- | --- |
| `SUPABASE_URL` | `https://YOUR-PROJECT-REF.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` (public client key) |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` (server-only secret; **do not share**) |
| `SUPABASE_ADMIN_EMAIL` | Admin email created in Step 2 (exact match, case-insensitive) |
| `SITE_URL` | `https://portfolio-onyx-digital1.vercel.app` (or actual production domain) |
| `CMS_BACKEND` | `supabase` (only when Steps 1–4 are complete) |

**Keep the existing GitHub variables unchanged** as rollback. You can use `CMS_BACKEND=github` or remove the variable to restore the Phase 1 CMS. Supabase updates do not touch GitHub JSON once the switch is active.

### Step 4 — Configure password reset

Supabase → Authentication → URL Configuration:
- Site URL: `https://portfolio-onyx-digital1.vercel.app`
- Allowed Redirect URLs: add `https://portfolio-onyx-digital1.vercel.app/admin/reset.html`

For your own custom domain, update both these settings and Vercel `SITE_URL`. Password reset is an email link using the Supabase Auth recovery flow. A custom email SMTP provider is recommended for reliable production email delivery.

### Step 5 — Deploy and import existing GitHub projects

1. Commit changed files from Phase 2 ZIP. Let Vercel deploy with `CMS_BACKEND=github` (or unset) initially; verify the original site still works.
2. Once the Supabase project, SQL, user, admin allowlist and env are ready, set `CMS_BACKEND=supabase` and **redeploy**.
3. Open `/admin/`, sign in using **admin email + Supabase Auth password** (the previous `ADMIN_PASSWORD` does not apply in Supabase mode).
4. Click **Import GitHub projects**. The browser reads **existing** `/content/projects.json`; the server validates and adds missing project IDs to PostgreSQL. It never overwrites projects with the same IDs. Legacy image file paths remain valid.
5. Refresh the public site after ~15–45 seconds. Confirm project cards load (no GitHub redeploy required for future edits).
6. Create a draft, edit it, publish it, upload cover/gallery, delete a test project, log out and in, then test reset email. Check a draft ID is not returned from public `/api/projects`.
7. Save an export/backup of `content/projects.json` and do not delete legacy `/assets/uploads/` images: imported projects still reference these assets.

## Rollback

If Supabase is misconfigured or unavailable, set `CMS_BACKEND=github`, redeploy. The old GitHub-powered CMS and original project content remain available. This rollback does **not** merge edits made in Supabase into GitHub. Export those separately before a permanent rollback.

## Security notes

- Sessions use **HttpOnly, SameSite=Strict cookies** restricted to `/api`; authentication and admin authorization are verified against Supabase Auth and a private `cms_admins` table on each authorized request. Never trust a JWT payload without server verification.
- Cookies are `Secure` in production; POST operations require the same origin. Supabase secret key is server-only. `portfolio_projects` uses RLS: public users read only `published=true` rows and cannot modify records.
- Image uploads are checked for accepted types and a 2 MB maximum, and stored in a public portfolio-media bucket. Don't upload confidential or client-private content into that bucket.
- Basic IP throttling on login is per Vercel function instance only; **configure Vercel Firewall / rate limiting for distributed protection**.
- The legacy `/content/projects.json` is still a public static file while you keep it for migration/rollback, including any drafts stored there. Do not place sensitive unpublished data in that file. Later migration cleanup can remove legacy files once backup is complete.
- Admin is a private management UI, not a general user-accounts or multi-role system. Full-page editing and media-library management are later phases.

## Test commands

```bash
node --test tests/*.test.js
```

API tests mock Supabase/GitHub and do not prove your production Supabase credentials, RLS policies, email delivery or Vercel deployment work. Complete the manual steps above.
