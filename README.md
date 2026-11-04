> **Project content refresh:** See [OWN_SITE_CONTENT_UPDATE.md](OWN_SITE_CONTENT_UPDATE.md) for the spreadsheet-based project names, live links and how to replace temporary media.

> **CMS Developer edition (Nov 4, 2026):** Five CMS-focused services, restored original inner-page designs, homepage navigation updates and an admin Services editor are included. Read [CMS_DEVELOPER_UPDATE.md](CMS_DEVELOPER_UPDATE.md) for details and deployment guidance.

> **Updated release:** See [DEPLOY_UPDATED.md](DEPLOY_UPDATED.md) for changes, safety notes and exact GitHub/Vercel deployment instructions.

# Muhammad Siddique — Portfolio / GitHub + Vercel Edition

A static HTML/CSS/JS portfolio with **Jotform** project enquiries and a **GitHub-backed admin dashboard** implemented with Vercel Node.js Functions.

**No PHP runtime, MySQL database, WordPress, SMTP account, or JetForm plugin is required.** Do not attempt to use the prior PHP CMS on Vercel: it has been replaced in this edition.

## Files

- `index.html`: main website, original interactive pages and Jotform project popup.
- `services/`: redirect aliases to the five original portfolio page layouts, plus the shared editable-service frontend.
- `content/services.json`: five CMS services that can be edited in the dashboard.
- `webdev_portfolio/`, `UIUX_portfolio/`, `graphic/`, `appdev_portfolio/`, `digital-marketing/`: original project galleries retained as the live service pages with CMS-focused descriptions.
- `admin/`: responsive project + CMS service management dashboard at `/admin/`.
- `api/admin.js`: Vercel serverless admin API for authentication and GitHub project updates.
- `content/projects.json`: public portfolio projects (includes a preserved draft test project from the live repo).
- `assets/uploads/`: images uploaded by the dashboard are committed here in GitHub.
- `cms/public.js`, `cms/public.css`: the public Selected Work section and modal.
- `vercel.json`: static deployment and no-index headers for the admin page.

## Deploy with GitHub and Vercel

1. Create a GitHub repository, for example `muhammad-siddique-portfolio`. Upload **the CONTENTS of this folder to the repository root**, not the enclosing ZIP folder.
2. In Vercel, select **Add New → Project → Import Git Repository** and choose your new repo.
3. Framework Preset: **Other**. Set **Root Directory** to `./` (repository root). Leave **Build Command** and **Output Directory** unset so Vercel serves the static website directly. Do not select PHP/WordPress.
4. Add these **server-side Environment Variables** under Vercel Project → Settings → Environment Variables before the first deployment or redeploy after saving. Use Production (and Preview only if you want preview CMS access):

   | Name | Value |
   |---|---|
   | `GITHUB_OWNER` | Your actual GitHub account or organization username |
   | `GITHUB_REPO` | Your actual GitHub repository name (not a URL) |
   | `GITHUB_BRANCH` | `main` (or your default branch name) |
   | `GITHUB_TOKEN` | GitHub fine-grained personal access token, scoped to this **one repository**, with **Contents: Read and write** permission |
   | `ADMIN_PASSWORD` | Your own strong unique password (minimum 12 characters) |
   | `SESSION_SECRET` | A cryptographically random secret string (minimum 32 characters) |

   Generate a secret using a local terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

5. **Redeploy** after setting the variables. Open `https://YOUR-SITE.vercel.app/admin/`, sign in using `ADMIN_PASSWORD` and add projects.
6. Each save/upload/delete **commits to GitHub**; because your Git repository is connected to Vercel, those commits trigger automatic redeployments. Project images may temporarily be unavailable until the deployment has finished. On first deploy the CMS's Selected Work section is intentionally hidden until you've published a project.

### Important CMS notes

- **Secrets never go in source code or your GitHub repository.** `GITHUB_TOKEN`, `ADMIN_PASSWORD`, and `SESSION_SECRET` must exist *only* in Vercel environment settings. `.gitignore` excludes `.env` files.
- The admin dashboard is at `/admin/`, **not** `/cms/admin.php`.
- Use HTTPS, a strong admin password, and Vercel Firewall/rate limiting to protect your login (the built-in function's simple per-instance login throttle is not a persistent distributed rate limiter). If a GitHub token is compromised, revoke it immediately.
- The CMS is designed for a single administrator and reasonable portfolios. It supports add/edit/delete, category, publish/draft, featured, descriptions, cover and gallery images. Uploads are compressed client-side and kept under 2 MB each.
- **If the repository is public, data saved in `content/projects.json`, including draft records, can be read from the repository and the publicly served JSON file.** Draft status hides projects from the website UI, not from raw files. Never put private client information in a draft.
- Image files and changed project content are version-controlled in GitHub. Removing a project from the CMS removes its record but not its already-uploaded images from Git history. Delete unused images manually from your repository if required.
- You can also edit `content/projects.json` by hand in GitHub. Keep the same JSON structure and publish flags.
- The legacy static demo portfolio cases in the reference package remain in the website; your newly published projects show in a separate **Selected Work** section. Replace example projects and confirm permissions for any third-party media before launch.

## Jotform enquiries

The **Start a project** popup embeds your form:

https://form.jotform.com/263056967949073

Submissions are handled by **Jotform**, not the GitHub CMS. To receive messages at **cms.m.siddique@gmail.com**, log into the Jotform account that owns the form and go to **Edit Form → Settings → Emails → Notification Email**. Configure the recipient as `cms.m.siddique@gmail.com` and save. Make a test submission on the LIVE Vercel site and check your inbox (including spam) and Jotform submissions. The website cannot configure your Jotform notification settings for you.

Your Jotform form may be edited at any time in Jotform; the iframe will show the updated version. If a browser blocks the embedded form, a link in the popup opens it directly. **Do not commit Jotform API keys or Gmail passwords into frontend JavaScript.**

## Testing locally

- Static website: any local static server, for example `python -m http.server 8080` from the project root.
- The **admin API only executes on Vercel**. To test the dashboard locally, use `vercel dev` with environment variables available to the Vercel CLI.
- Static serving alone makes the admin login unavailable, which is expected; the website and Jotform iframe still work.
- Avoid uploading your GitHub token or Vercel env file when sharing the ZIP with others.

## Notes on privacy and ownership

The form is hosted by Jotform, subject to their applicable privacy policy; privacy disclosures have been updated accordingly. Portfolio demo media included from the supplied original reference archive may have independent rights/restrictions and should be replaced by your own work before public use.
