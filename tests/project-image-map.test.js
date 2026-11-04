'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const areas=['wordpress','shopify','wix','other-cms','selected-sites'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('PROJECT_IMAGE_MAP.json'));
test('every service card has a project-specific local image',()=>{
 let count=0;
 for(const area of areas){
  const html=read(area+'/index.html');
  const cards=html.match(/<article\b[^>]*class="card(?: flip)?"[^>]*>.*?<\/article>/gs)||[];
  const m=html.match(/const PROJECTS\s*=\s*(\[.*?\])\s*;/s);
  assert(m,area);
  const projects=JSON.parse(m[1]);
  assert.equal(cards.length,projects.length,area);
  for(let i=0;i<projects.length;i++){
   const project=projects[i];
   assert(project.shot && project.shot.endsWith('.webp'),area+' '+project.title);
   assert(fs.existsSync(path.resolve(root,area,project.shot)),area+' '+project.title);
   assert(cards[i].includes('class="page"'),area+' '+project.title);
   assert(cards[i].includes('src="'+project.shot+'"'),area+' '+project.title);
   count++;
  }
  assert(!html.includes('image.thum.io'),area+' remote screenshot request');
 }
 assert.equal(count,50);
});
test('Webflow gallery and sticky cards all use local images',()=>{
 const html=read('webflow/index.html');
 const m=html.match(/const WORLDS\s*=\s*(\[.*?\])\s*;/s);assert(m);
 const worlds=JSON.parse(m[1]);
 for(const w of worlds) for(const it of w.items){
  assert(it.f.endsWith('.webp'),w.label);
  assert(fs.existsSync(path.resolve(root,'webflow',it.f)),w.label);
 }
 const cards=html.match(/<article\b[^>]*class="vnext-work__card"[^>]*>.*?<\/article>/gs)||[];
 assert.equal(cards.length,13);
 for(const c of cards){
  const m=c.match(/class="vnext-work__image" src="([^"]+)"/); assert(m,c.slice(0,80));
  assert(fs.existsSync(path.resolve(root,'webflow',m[1])),m[1]);
 }
 assert(!html.includes('image.thum.io'));
});
test('every CMS metadata project has a valid local image',()=>{
 const projects=JSON.parse(read('content/projects.json')).projects;
 assert.equal(projects.length,30);
 for(const p of projects){assert(p.image,p.title);assert(fs.existsSync(path.join(root,p.image)),p.title);}
 assert.equal(Object.keys(manifest.placeholders).length,49);
});
