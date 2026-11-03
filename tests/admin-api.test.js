'use strict';
// No live GitHub calls. Run: node --test tests/admin-api.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/admin');

function configure() {
 Object.assign(process.env, {
  GITHUB_OWNER: 'siddo-web', GITHUB_REPO: 'portfolio', GITHUB_BRANCH: 'main',
  GITHUB_TOKEN: 'test-token-not-real', ADMIN_PASSWORD: 'test-password-12345',
  SESSION_SECRET: 'test-secret-0123456789abcdef0123456789abcdef',
 });
}
function req(method='GET', action='status', body, cookie='', origin='http://localhost:3000', ip='127.0.0.1') {
 return { method, query:{action}, body, headers:{host:'localhost:3000',origin,cookie,'x-forwarded-for':ip} };
}
function response() {
 return {
  headers:{},statusCode:200,body:null,
  setHeader(k,v){this.headers[k.toLowerCase()]=v},
  status(n){this.statusCode=n;return this},
  json(obj){this.body=obj;return this},
 };
}
async function call(r) { const res=response(); await handler(r,res);return res; }
async function login(ip='127.0.0.1') {
 const r=await call(req('POST','login',{password:process.env.ADMIN_PASSWORD},'','http://localhost:3000',ip));
 assert.equal(r.statusCode,200,JSON.stringify(r.body));
 const cookie=r.headers['set-cookie'].split(';')[0];
 return cookie;
}
const originalFetch=global.fetch;
function mockGithub(initial={projects:[]}, exists=true) {
 let data=initial, sha=1, writes=0;
 global.fetch=async (url,opts)=>{
  const path=new URL(url).pathname;
  const isProjects=path.endsWith('/content/projects.json');
  const send=(status,body)=>({ok:status>=200&&status<300,status,async json(){return body}});
  if(!path.startsWith('/repos/siddo-web/portfolio/contents/'))return send(404,{message:'Not Found'});
  if(isProjects && opts.method==='GET')return exists?send(200,{sha:'sha-'+sha,content:Buffer.from(JSON.stringify(data)).toString('base64')}):send(404,{message:'Not Found'});
  if(opts.method==='PUT'){
   const incoming=JSON.parse(opts.body);
   if(isProjects){
    if(!exists || incoming.sha!=='sha-'+sha)return send(422,{message:'SHA mismatch'});
    data=JSON.parse(Buffer.from(incoming.content,'base64').toString('utf8'));sha++;writes++;
   } else {writes++;}
   return send(201,{content:{sha:'new-sha'}});
  }
  return send(404,{message:'Not Found'});
 };
 return {get data(){return data},get writes(){return writes},restore(){global.fetch=originalFetch}};
}

configure();
test('rejects missing configuration without exposing secrets',async()=>{
 const old=process.env.GITHUB_TOKEN;delete process.env.GITHUB_TOKEN;
 const r=await call(req());assert.equal(r.statusCode,503);
 assert.equal(r.body.ok,false);assert.doesNotMatch(JSON.stringify(r.body),/test-token-not-real/);
 process.env.GITHUB_TOKEN=old;
});
test('status is protected and cross-origin POST is rejected',async()=>{
 assert.equal((await call(req('GET','status'))).statusCode,401);
 assert.equal((await call(req('POST','login',{password:'abc'},'','https://evil.example'))).statusCode,403);
 assert.equal((await call(req('POST','login',{password:'abc'},'','', '198.51.100.3'))).statusCode,403);
});
test('login, status, logout and password rotation',async()=>{
 const c=await login('10.1.1.1');
 assert.equal((await call(req('GET','status',undefined,c))).statusCode,200);
 const out=await call(req('POST','logout',{},c));
 assert.equal(out.statusCode,200);assert.match(out.headers['set-cookie'],/Max-Age=0/);
 const old=process.env.ADMIN_PASSWORD;
 process.env.ADMIN_PASSWORD='test-new-password-12345';
 assert.equal((await call(req('GET','status',undefined,c))).statusCode,401);
 process.env.ADMIN_PASSWORD=old;
});
test('invalid login throttled after 6 attempts on one instance',async()=>{
 for(let i=0;i<6;i++)assert.equal((await call(req('POST','login',{password:'wrong'},'','http://localhost:3000','10.4.4.4'))).statusCode,401);
 assert.equal((await call(req('POST','login',{password:'wrong'},'','http://localhost:3000','10.4.4.4'))).statusCode,429);
});
test('missing GitHub project file returns configuration error, not empty projects',async()=>{
 const gh=mockGithub(undefined,false);
 try{const c=await login('10.1.1.2');
  const r=await call(req('GET','projects',undefined,c));
  assert.equal(r.statusCode,502);assert.match(r.body.message,/project file not found/i);
  assert.equal(gh.writes,0);
 }finally{gh.restore()}
});
test('project CRUD preserves status and featured field',async()=>{
 const gh=mockGithub();
 try{
  const c=await login('10.1.1.3');
  const made=await call(req('POST','save',{id:'',project:{title:'Example project',category:'web-design',published:true,featured:true,summary:'Made for testing'}},c));
  assert.equal(made.statusCode,200,JSON.stringify(made.body));
  assert.equal(gh.data.projects.length,1);
  const id=made.body.project.id;
  assert.equal(gh.data.projects[0].featured,true);
  const list=await call(req('GET','projects',undefined,c));
  assert.equal(list.body.projects[0].title,'Example project');
  const edited=await call(req('POST','save',{id,project:{title:'Updated project',category:'web-development',published:false,featured:false}},c));
  assert.equal(edited.statusCode,200);
  assert.equal(edited.body.project.id,id);assert.equal(gh.data.projects[0].published,false);
  const deleted=await call(req('POST','delete',{id},c));
  assert.equal(deleted.statusCode,200);assert.equal(gh.data.projects.length,0);
  assert.equal(gh.writes,3);
 }finally{gh.restore()}
});
test('bad categories and javascript URLs are rejected',async()=>{
 const gh=mockGithub();
 try{const c=await login('10.1.1.4');
  const base={title:'Unsafe',category:'web-development',published:true,url:'javascript:alert(1)'};
  const r=await call(req('POST','save',{project:base},c));
  assert.equal(r.statusCode,400);assert.match(r.body.message,/Only http and https/i);
  assert.equal(gh.writes,0);
 }finally{gh.restore()}
});
test('image type validation rejects invalid payload before GitHub',async()=>{
 const gh=mockGithub();
 try{const c=await login('10.1.1.5');
  const bad=await call(req('POST','upload',{mime:'image/png',data:Buffer.from('not an image').toString('base64')},c));
  assert.equal(bad.statusCode,400);assert.equal(gh.writes,0);
  const image=Buffer.alloc(200);image.write('RIFF',0);image.write('WEBP',8);
  const good=await call(req('POST','upload',{mime:'image/webp',data:image.toString('base64')},c));
  assert.equal(good.statusCode,200);assert.match(good.body.path,/^assets\/uploads\/[a-z0-9-]+\.webp$/i);
  assert.equal(gh.writes,1);
 }finally{gh.restore()}
});
test('unsupported methods do not mutate data',async()=>{
 const r=await call(req('DELETE','delete',{id:'test'}));assert.equal(r.statusCode,405);
 assert.equal(r.headers.allow,'GET, POST');
});
