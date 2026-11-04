'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const retired=require('../api/admin');
function res(){return {code:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(n){this.code=n;return this;},json(body){this.data=body;return this;}};}
test('old login endpoint is permanently disabled and never sets a session',()=>{
 for(const action of ['login','logout','save','upload','saveService','deleteProject']){
  const r=res();retired({method:'POST',query:{action},body:{password:'anything'}},r);
  assert.equal(r.code,410);assert.equal(r.data.ok,false);assert.equal(r.headers['set-cookie'],undefined);
 }
});
test('no privileged admin implementation or login UI is shipped',()=>{
 assert(!fs.existsSync(path.join(root,'admin')));
 const code=fs.readFileSync(path.join(root,'api/admin.js'),'utf8');
 for(const forbidden of ['GITHUB_TOKEN','ADMIN_PASSWORD','SESSION_SECRET','github.com','Set-Cookie','fetch('])assert(!code.includes(forbidden),forbidden);
});
test('vercel redirects obsolete admin URLs and excludes stale folder from deployment',()=>{
 const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
 for(const src of ['/admin','/admin/','/admin/:path*'])assert(vercel.redirects.some(r=>r.source===src&&r.destination==='/'));
 assert(fs.readFileSync(path.join(root,'.vercelignore'),'utf8').includes('admin/'));
});
