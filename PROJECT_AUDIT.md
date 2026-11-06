# Portfolio Project Inventory and QA — 6 November 2026

## Inventory reconciliation

- 76 unique CSV project records retained, including metadata and original URLs.
- 30 older website catalog records cross-checked and conservatively reconciled against the CSV. No unique existing-site project dropped.
- 68 public catalog entries: 17 category-assigned website/personal projects, 16 distinctly labeled components/workflows, 35 platform-unconfirmed website references in `/selected-sites/`.
- 8 entries kept in `content/review-queue.json`, not published as finished client work. The full CSV remains in `content/project-source.csv` for audit and future review.
- No duplicate normalized URL or exact title is present in the merged inventory. Cross-project similarities have not been merged without a reliable match.

## Separation rules

The five service filters show only corresponding `website`/`personal` entries. Technical components and workflows are grouped separately on their relevant service pages. Entries with an unconfirmed CMS are never placed into a specific platform group merely from appearance or name. Demo briefs, concepts and entries lacking an approved destination are unpublished and kept for review. Ownership, client authorization and deliverables must be verified before writing a stronger case study.

## Functional checks

40 Node automated tests passed, including actual execution of the shared project-gallery script in a simulated DOM to check filtering, searching, pagination and per-service isolation. Tested deployed-asset paths, public/read-only API behavior, photo references, no repeat titles/URLs, navigation targets in markup, security headers/CSP hashes and Vercel redirects. The static HTTP routes are served without a build step or package-manager dependencies.

**Not yet verified:** actual responsive pixel rendering, device-specific menu/door animation performance, third-party form submission and independent HTTP reachability of every supplied project URL. The available Chromium installation has a managed navigation block even for localhost; therefore a complete real-browser visual pass was not possible in this environment. On your deployment, manually verify a 375px phone, tablet and desktop viewport, menu/dialog Escape behavior, Jotform submissions and all public website URLs.

## Publishing follow-up

1. Confirm a CMS platform for each of the 35 archived references. Move only confirmed websites into a service category with the right `kind`, then remove any identical archive card.
2. Confirm project contribution and client approval for each reference before using phrases like “built for” or claiming full-site delivery.
3. Review the 8 unpublished records individually; publish an item only once its status, intended display type and public link are appropriate.
4. Check external site availability; a syntactically valid URL is not proof that its site is currently online.
