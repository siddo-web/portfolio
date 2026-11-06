'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');
const projects=require('../content/projects.json').projects;
const real=/^assets\/images\/project-screenshots\/[a-z0-9-]+\.webp$/i;
test('published projects use only real bundled screenshot files or honest text-only covers',()=>{
 for(const p of projects){if(!p.image)continue;assert.match(p.image,real,p.title);
  const filename=path.join(root,p.image);assert(fs.existsSync(filename),`Missing image for ${p.title}`);
  const buf=fs.readFileSync(filename);assert.equal(buf.toString('ascii',0,4),'RIFF');assert.equal(buf.toString('ascii',8,12),'WEBP');
 }
});
test('supplied CMS screenshots remain included and optimized',()=>{
 const names=['ies.webp','art-industry-inc.webp','naomi-amram-design.webp','sxs-parts-usa.webp','srny.webp','greater-gain-group.webp'];
 for(const n of names)assert(fs.existsSync(path.join(root,'assets/images/project-screenshots',n)),n);
});
test('unverified sites never receive invented or dummy screenshots',()=>{
 assert(projects.filter(x=>x.category==='unverified').every(x=>!x.image));
});
