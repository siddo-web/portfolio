'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['index.html','wordpress/index.html','shopify/index.html','webflow/index.html','wix/index.html','other-cms/index.html','webdev_portfolio/index.html','UIUX_portfolio/index.html','graphic/index.html','appdev_portfolio/index.html','digital-marketing/index.html','explorer.html','privacy.html','services/wordpress-development/index.html','services/shopify-development/index.html','services/webflow-wix-development/index.html','services/cms-migration-integration/index.html','services/cms-support-optimization/index.html'];
function read(f){return fs.readFileSync(path.join(root,f),'utf8');}
test('every published page has canonical SEO metadata and correct branding',()=>{
 for(const page of pages){const s=read(page);assert.match(s,/<link rel="canonical" href="[^"]+">/,page);assert(!s.includes('id="nl-badge-frame"'),page);assert(!s.includes('ms-inner-demo" role="note"'),page);assert(!/<meta property="og:url" content="assets\//.test(s),page);}
 assert.match(read('index.html'),/form\.jotform\.com\/263056967949073/);
});
test('all active local script and stylesheet paths exist',()=>{
 for(const page of pages){const s=read(page);const re=/<(?:script[^>]+src|link[^>]+href)="([^"]+)"/g;let m;
  while((m=re.exec(s))){const value=m[1].split('?')[0];if(!value||value.endsWith('/')||value.startsWith('https:')||value.startsWith('http:')||value.startsWith('#')||value.startsWith('data:'))continue;
   const file=value.startsWith('/')?path.resolve(root,value.slice(1)):path.resolve(root,path.dirname(page),value);assert(fs.existsSync(file),`${page} references missing ${value}`);
  }
 }
});
test('unused large media and archived original pages removed',()=>{
 assert(!fs.existsSync(path.join(root,'webdev_portfolio/assets/media/ppt.mp4')));
 assert(fs.statSync(path.join(root,'webdev_portfolio/assets/media/5d8ee86c25-project-2.mp4')).size<5_000_000);
 assert(!fs.existsSync(path.join(root,'webdev_portfolio/manifest.json')));
 assert(!fs.existsSync(path.join(root,'assets/other/7b48714177-asset.html')));
});
