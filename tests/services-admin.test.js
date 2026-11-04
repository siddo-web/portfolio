'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const initial=require('../content/services.json');
test('five services have unique stable routes and fully described content',()=>{
 assert.equal(initial.services.length,5);
 const slugs=initial.services.map(x=>x.slug);assert.equal(new Set(slugs).size,5);
 initial.services.forEach(x=>{assert(x.title&&x.summary&&x.intro&&x.faq.length&&x.benefits.length);});
});
test('services are managed as safe read-only public JSON, not through a login',()=>{
 const src=fs.readFileSync(path.join(root,'services/public.js'),'utf8');
 assert(src.includes('../content/services.json'));
 assert(!src.includes('/api/admin'));
 assert(!fs.existsSync(path.join(root,'admin')));
});
