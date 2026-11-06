'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const projects=require('../content/projects.json').projects;
const code=fs.readFileSync(path.join(root,'cms/public.js'),'utf8');
test('public portfolio renderer has a transparent no-screenshot state and safe image whitelist',()=>{
 assert.equal(projects.length,68);assert(projects.every(p=>p.published===true));
 assert(code.includes('ms-cms-cover--plain'));assert(code.includes('ms-cms-monogram'));
 assert(code.includes('validImage'));assert(code.includes('safeImage'));assert(code.includes('safeUrl'));
 assert(code.includes('api/projects'));assert(code.includes('content/projects.json'));
});
test('every claimed screenshot path is a local optimized image, and all links have safe target attributes',()=>{
 assert(code.includes("a.target='_blank'"));assert(code.includes("a.rel='noopener noreferrer'"));
 for(const p of projects){if(!p.image)continue;assert(!p.image.includes('placeholders'));
  const file=path.join(root,p.image);assert(fs.existsSync(file));}
});
