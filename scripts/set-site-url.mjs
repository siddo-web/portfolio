/** Set the existing portfolio's canonical and social-card origin for a custom HTTPS domain.
 * Usage: SITE_URL=https://example.com node scripts/set-site-url.mjs
 * Inline scripts are not edited; running refresh-csp afterwards remains safe.
 */
import fs from 'node:fs';
import path from 'node:path';
let base;
try { base = new URL(process.env.SITE_URL || ''); }
catch { console.error('SITE_URL must be a valid https:// origin'); process.exit(1); }
if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash) {
  console.error('SITE_URL must be a clean HTTPS origin, such as https://portfolio.example.com');
  process.exit(1);
}
const pages = {'index.html':'/','wordpress/index.html':'/wordpress/','shopify/index.html':'/shopify/',
  'webflow/index.html':'/webflow/','wix/index.html':'/wix/','other-cms/index.html':'/other-cms/',
  'selected-sites/index.html':'/selected-sites/','explorer.html':'/explorer.html',
  'privacy.html':'/privacy.html'};
const root = path.resolve(import.meta.dirname, '..');
let changed = 0;
for (const [filename, route] of Object.entries(pages)) {
  const file = path.join(root, filename);
  if (!fs.existsSync(file)) continue;
  const current = fs.readFileSync(file, 'utf8');
  let content = current;
  const canonical = `<link rel="canonical" href="${base.origin + route}">`;
  content = content.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, canonical);
  const setMeta = (property, value) => {
    const meta = new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property}["'])[^>]*>`, 'gi');
    content = content.replace(meta, tag => /\bcontent=["'][^"']*["']/.test(tag)
      ? tag.replace(/\bcontent=["'][^"']*["']/, `content="${value}"`)
      : tag.replace(/\/?>(\s*)$/, ` content="${value}">$1`));
  };
  setMeta('og:url', base.origin + route);
  setMeta('og:image', base.origin + '/assets/images/muhammad-siddique-og.jpg');
  if (content !== current) { fs.writeFileSync(file, content); changed++; }
}
console.log(`Updated SEO metadata on ${changed} pages for ${base.origin}`);
