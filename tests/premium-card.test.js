const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('Premium Profile Card is rendered locally with no dangling iframe route',()=>{
  assert.match(html,/Muhammad Siddique Premium Profile Card/);
  assert.match(html,/hc__back-panel/);
  assert.match(html,/CMS<br>DEVELOPER/);
  assert(!html.includes("const SRC = 'ability-card/'"));
  assert(!html.includes('frame.src = SRC'));
  assert(!html.includes('setTimeout(showLite, window.__ONEFILE ? 15000 : 45000)'));
  assert.match(html,/if \(loader\) loader.hidden = true;/);
});
test('All images for the profile card exist locally',()=>{
 for(const filename of ['muhammad-siddique-card.webp','4c7752569d-win_bg.webp','970419499e-win_sub.webp'])
   assert(fs.existsSync(path.join(root,'assets/images',filename)),filename);
});
test('Card preserves tilt, flip, Escape/Close and focus handling',()=>{
 for(const token of ['hc.classList.toggle(\'flip\')','hc.style.setProperty(\'--ry\'','holoClose','e.key === \'Escape\'','startScroll();','FOCUSABLE'])
   assert(html.includes(token),token);
});
