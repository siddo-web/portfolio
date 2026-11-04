# Premium Profile Card — loading fix

The previous home page tried to open an iframe at `ability-card/`, but that folder was not included in the project or the deployed GitHub repository. The embedded card never sent a ready/progress event, so its loader stayed at 0% for up to 45 seconds.

**Fixed:** Clicking **My profile card** now opens the local interactive card immediately. The front uses the existing artwork and portrait assets. The reverse is a CMS Developer profile. It supports gentle pointer tilt, touch interaction, flip on click/tap, keyboard Enter/Space and Escape, a Close button, and focus management. No network request, WebGL runtime or missing iframe is needed.

The rest of the portfolio layout, media, service/project content, animations, and CMS setup were not changed.

### Deployment

Extract the ZIP to your Git working copy, replacing matching files without removing `.git` or local `.env`. Run `git status`, then `git add -A`, `git commit -m "Fix premium profile card"`, `git push origin main`. For Vercel, allow the new deployment to finish, then hard refresh the homepage (`Ctrl + Shift + R`).
