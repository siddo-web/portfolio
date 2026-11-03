'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../api/admin');
const actualFetch=global.fetch;
const old={};
let stored,sha;
function result(){return {code:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(n){this.code=n;return this;},json(v){this.data=v;return this;}};}
function req(method,action,body={},cookie=''){return {method,query:{action},body,headers:{host:'example.test',origin:'https://example.test',cookie,'x-forwarded-for':'10.0.0.10'}};}
function sessionCookie(r){return String(r.headers['set-cookie']).split(';')[0];}
before(()=>{
 for(const k of ['GITHUB_OWNER','GITHUB_REPO','GITHUB_TOKEN','ADMIN_PASSWORD','SESSION_SECRET','GITHUB_BRANCH','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN']){old[k]=process.env[k];delete process.env[k];}
 Object.assign(process.env,{GITHUB_OWNER:'siddo-web',GITHUB_REPO:'portfolio',GITHUB_TOKEN:'fake-test-token',ADMIN_PASSWORD:'a-very-long-test-password',SESSION_SECRET:'z'.repeat(48),GITHUB_BRANCH:'main'});
 stored=[{id:'05df65d2-2e18-4516-8091-1ffa780b15e4',title:'Existing',category:'web-development',published:false}];sha='old-sha';
 global.fetch=async(url,opt)=>{
  const file=String(url);assert.match(file,/api\.github\.com\/repos\/siddo-web\/portfolio\/contents\//);
  if(opt.method==='GET')return {ok:true,json:async()=>({sha,content:Buffer.from(JSON.stringify({projects:stored})).toString('base64')})};
  if(opt.method==='PUT'){
   const d=JSON.parse(opt.body);
   if(d.sha&&d.sha!==sha)return{ok:false,status:409,json:async()=>({message:'conflict'})};
   if(file.includes('/content/projects.json'))stored=JSON.parse(Buffer.from(d.content,'base64').toString()).projects;
   sha='updated-sha';return{ok:true,json:async()=>({content:{sha}})};
  }
  return {ok:false,status:404,json:async()=>({message:'not found'})};
 };
});
after(()=>{global.fetch=actualFetch;for(const [k,v] of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
test('rejects cross-origin POST and bad password',async()=>{
 const cross=req('POST','login',{password:'a-very-long-test-password'});cross.headers.origin='https://attacker.test';
 let r=result();await api(cross,r);assert.equal(r.code,403);
 r=result();await api(req('POST','login',{password:'wrong'}),r);assert.equal(r.code,401);
});
test('authentication, protected listing and logout',async()=>{
 let r=result();await api(req('GET','projects'),r);assert.equal(r.code,401);
 r=result();await api(req('POST','login',{password:'a-very-long-test-password'}),r);assert.equal(r.data.ok,true);
 const cookie=sessionCookie(r);
 r=result();await api(req('GET','projects',{},cookie),r);assert.equal(r.code,200);assert.equal(r.data.projects.length,1);
 r=result();await api(req('POST','logout',{},cookie),r);assert.equal(r.data.ok,true);
});
test('save persists featured and replaceLegacy properties',async()=>{
 const login=result();await api(req('POST','login',{password:'a-very-long-test-password'}),login);
 const cookie=sessionCookie(login);
 const project={title:'Live portfolio',category:'web-design',featured:true,replaceLegacy:true,published:true,url:'https://example.com/',image:'',gallery:[]};
 const out=result();await api(req('POST','save',{project},cookie),out);
 assert.equal(out.code,200);assert.equal(out.data.project.featured,true);assert.equal(out.data.project.replaceLegacy,true);assert.equal(stored.length,2);
 const bad=result();await api(req('POST','save',{project:{...project,url:'javascript:alert(1)'}},cookie),bad);assert.equal(bad.code,400);
 const del=result();await api(req('POST','delete',{id:out.data.project.id},cookie),del);assert.equal(del.code,200);
 assert.equal(stored.length,1);
});
test('upload rejects invalid mime and malformed data',async()=>{
 const login=result();await api(req('POST','login',{password:'a-very-long-test-password'}),login);
 const r=result();await api(req('POST','upload',{mime:'image/svg+xml',data:'YWJj'},sessionCookie(login)),r);
 assert.equal(r.code,400);
});
