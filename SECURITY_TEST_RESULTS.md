> **SUPERSEDED:** This document describes an earlier login-enabled build. The current version has no website login. Follow `README.md` and `NO_LOGIN_SECURITY_UPDATE.md` instead.

# Security audit summary — November 5, 2026

Scope: last duplicate-free portfolio ZIP; current static source, GitHub-backed CMS API, Vercel config, and public content rendering. No production credentials were available.

| Area | Finding | Action |
| --- | --- | --- |
| Source secrecy | **GitHub repository visibility: PUBLIC** | Account owner must make it private; visible frontend code remains downloadable |
| Admin authentication | Signed cookie/session, validation present | Secure `__Host-` cookie, two-hour expiry, stronger origin checks |
| Login guessing | In-memory throttle optional distributed Redis | Bound memory; enable Redis/Vercel Firewall manually |
| API exception details | Raw upstream errors could reach client | Generic client error, server-side action/status log |
| CMS HTML injection | Door benefits rendered through `.innerHTML` | Render with `textContent`/DOM nodes |
| Browser script policy | No general CSP | CSP with 33 SHA-256 hashes, no inline-script wildcard |
| Canonical/sitemap Host header | Fallback used request Host | Fixed production origin with `SITE_URL` override |
| Raw CMS fallback | Client attempted raw `content/projects.json` after API failure | Removed raw fallback; published-only `/api/projects` |
| Deployment exposure | Source scripts, docs and local templates could be deployed | Root `.vercelignore` added |
| Token scan | No obvious embedded GitHub keys/private keys found in source snapshot | Git history and deployed env settings must still be audited |
| Private CMS drafts | Draft data in repository `content/projects.json` | Private repository or private data store needed for real confidentiality |

## Validation

- All **28 Node test cases passed** (`node --test tests/*.test.js`).
- Node JS syntax check passed for the modified API.
- Existing project pages, site data and media preserved from last ZIP.
- CSP inline-script hashes verified against all HTML pages.
- Automated browser check was **blocked by the test environment** (`net::ERR_BLOCKED_BY_ADMINISTRATOR`), so live browser behavior and real Vercel headers **have not been verified**. Test these on your Vercel deployment after pushing.

**No assurance of invulnerability or frontend-copy prevention is claimed.** See `SECURITY_DEPLOYMENT_GUIDE.md` for the necessary account-level controls.
