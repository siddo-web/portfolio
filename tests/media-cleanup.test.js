'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['index.html','wordpress/index.html','shopify/index.html','webflow/index.html','wix/index.html','other-cms/index.html','selected-sites/index.html'];
test('obsolete old source text does not remain in active text files',()=>{
 const bad=/therishithakor|enrichr|rishi thakor|thebornebytethakor/i;
 for(const name of pages){const s=fs.readFileSync(path.join(root,name),'utf8');assert(!bad.test(s),name);}
});
test('all 14 owner-supplied screenshots are available as optimized WebP',()=>{
 const files=['art-industry-inc','william-h-thielen','tikuya-travels','oe-machine-company','reags-reviews','ies','naomi-amram-design','b10-life','sxs-parts-usa','hollywood-associates','greater-gain-group','srny','deviant-apple-inc','nolan-wells-studios'];
 for(const name of files){const f=path.join(root,'assets/images/project-screenshots',name+'.webp');assert(fs.existsSync(f),name);assert(fs.statSync(f).size>4000,name);}
});
test('all local project screenshot paths resolve to actual files',()=>{
 for(const name of pages){const html=fs.readFileSync(path.join(root,name),'utf8');const pat=/(?:src|poster)="(\.?\.?\/[^"<>]+\.(?:svg|png|jpg|jpeg|webp))"/g;let m;
  while((m=pat.exec(html))){const f=path.resolve(root,path.dirname(name),m[1]);assert(fs.existsSync(f),name+': '+m[1]);}
 }
});
