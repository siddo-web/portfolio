'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const expected = {
  wordpress: ['Art & Industry Inc.', 'William H. Thielen', 'Tikuya Travels', 'OE Machine Company', 'Reags Reviews', 'IES — Innovative Engineering Solutions', 'Naomi Amram Design'],
  shopify: ['SXS Parts USA', 'Mardoo Scrubs', 'Featured Products Grid', 'Palace Product Template'],
  webflow: ['Siddique — Webflow Portfolio', 'Greater Gain Group', 'SRNY'],
  wix: ['Hollywood Associates', 'Steph Saffer', 'Heroes of Tomorrow Africa'],
  'other-cms': ['Deviant Apple Inc.', 'Nolan Wells Studios', 'WooCommerce to Shopify Migration', 'OnyxDigital — Admin CMS'],
};
test('owner supplied site titles remain on appropriate service pages', () => {
  for (const [page, titles] of Object.entries(expected)) {
    const html = read(page + '/index.html');
    for (const title of titles) assert(html.includes(title), `${page} missing ${title}`);
  }
});
test('service pages keep original design but only unique site-level project entries', () => {
  for (const slug of [...Object.keys(expected), 'selected-sites']) {
    const txt = read(slug + '/index.html');
    const count = slug === 'webflow'
      ? (txt.match(/<article\b[^>]*class="vnext-work__card"/g) || []).length
      : (txt.match(/<article\b[^>]*class="card(?: flip)?"[^>]*>/g) || []).length;
    assert(count >= 3, `${slug}: fewer than three cards`);
  }
  for (const slug of ['webflow', 'wix']) assert(read(slug + '/index.html').includes('not a completed client'),slug);
});
test('CMS categories remain valid, with no duplicate published project URLs', () => {
  const entries = JSON.parse(read('content/projects.json')).projects;
  const cats = new Set(entries.filter(p => p.published).map(p => p.category));
  assert.deepEqual([...cats].sort(), ['wordpress','shopify','webflow','wix','other-cms'].sort());
  const norm = url => { try { const u = new URL(url); return u.hostname.replace(/^www\./,'').toLowerCase() + decodeURIComponent(u.pathname).replace(/\/$/,'').toLowerCase(); } catch { return ''; } };
  const seen = new Set();
  for (const p of entries) { const key=norm(p.url); if (!key) continue; assert(!seen.has(key),`CMS duplicate: ${p.title} (${key})`); seen.add(key); }
  assert(!entries.some(p => p.title === 'SXS Performance Part'), 'Unpublished duplicate test record must not return');
});
