'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.join(__dirname,'..');
const v=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const common=Object.fromEntries(v.headers[0].headers.map(h=>[h.key,h.value]));
test('strong site-wide headers and explicit CSP script hashes',()=>{
 assert.match(common['Content-Security-Policy'],/script-src 'self' 'sha256-/);
 assert.doesNotMatch(common['Content-Security-Policy'],/script-src[^;]*'unsafe-inline'/);
 for(const directive of ["object-src 'none'","frame-ancestors 'self'","base-uri 'self'","connect-src 'self'","frame-src 'self' https:\/\/form.jotform.com"]){
  assert(common['Content-Security-Policy'].includes(directive),`missing ${directive}`);
 }
 assert.equal(common['X-Frame-Options'],'SAMEORIGIN');
});
test('inline scripts on every page match deployed CSP allowlist',()=>{
 const csp=common['Content-Security-Policy'];
 function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){
  const f=path.join(d,e.name);if(e.isDirectory())walk(f);
  else if(e.name.endsWith('.html')){
   const html=fs.readFileSync(f,'utf8');
   for(const m of html.matchAll(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)){
    if(!m[1].trim())continue;
    const hash=createHash('sha256').update(m[1]).digest('base64');
    assert(csp.includes("'sha256-"+hash+"'"),f+': inline JS hash missing, run python scripts/refresh-csp.py');
   }
  }
 }}
 walk(root);
});
test('public CMS fetches only filtered API, not raw unpublished project list',()=>{
 const src=fs.readFileSync(path.join(root,'cms/public.js'),'utf8');
 assert(src.includes("'api/projects'"));
 assert(!src.includes("'content/projects.json'"));
 const ig=fs.readFileSync(path.join(root,'.vercelignore'),'utf8');
 assert(ig.includes('tests/')&&ig.includes('scripts/')&&ig.includes('.env.example'));
});
test('SEO origins are not formed from untrusted Host headers',()=>{
 const {siteUrl}=require('../api/seo-utils');
 const malicious={headers:{host:'spoof.example'}};
 assert.equal(siteUrl(malicious),'https://siddique-profile.vercel.app');
});

test('public project data does not contain unpublished drafts and cards can render',()=>{
 const data=require('../content/projects.json');
 assert(data.projects.length>=25);
 assert(data.projects.every(p=>p.published===true));
 const handler=require('../api/projects');
 const r={code:200,status(n){this.code=n;return this;},setHeader(){},json(obj){this.body=obj;return this;}};
 handler({method:'GET'},r);
 assert.equal(r.code,200);
 assert(r.body.projects.length>=25);
 assert(r.body.projects.every(p=>p.published===true));
});
