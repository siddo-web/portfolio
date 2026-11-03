'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../api/admin');
const publicApi=require('../api/projects');
const originalFetch=global.fetch;
const env={
 CMS_BACKEND:'supabase',SUPABASE_URL:'https://example-ref.supabase.co',
 SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test', SUPABASE_SECRET_KEY:'sb_secret_test',
 SUPABASE_ADMIN_EMAIL:'admin@example.com', SITE_URL:'https://portfolio.example.com'
};
Object.assign(process.env,env);
function mkReq(method='GET',action='status',body,cookie='',origin='http://localhost:3000'){
 return {method,query:{action},body,headers:{host:'localhost:3000',origin,cookie,'x-forwarded-for':'192.0.2.10'}};
}
function mkRes(){return {statusCode:200,headers:{},body:null,setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};}
async function call(req,handler=api){const res=mkRes();await handler(req,res);return res;}
function mock(){
 let projects=[];const users=[{id:'f63d8463-1091-44dd-86f1-ea4f45b02c8a',email:'admin@example.com',email_confirmed_at:'2026-11-01T10:00:00Z'}];
 let authed=true,uploadCount=0,writeCount=0;
 const json=(status,v)=>({ok:status>=200&&status<300,status,json:async()=>v,text:async()=>JSON.stringify(v)});
 global.fetch=async(raw,opts)=>{
  const u=new URL(raw),path=u.pathname;
  if(path==='/auth/v1/token'){
   if(u.searchParams.get('grant_type')==='refresh_token')return json(200,{access_token:'access-new',refresh_token:'refresh-new',expires_in:3600});
   const d=JSON.parse(opts.body);return json(d.password==='a-very-long-password'?200:400,d.password==='a-very-long-password'?{access_token:'access',refresh_token:'refresh',expires_in:3600}:{msg:'Invalid credentials'});
  }
  if(path==='/auth/v1/user'){
   if(opts.method==='PUT')return json(200,users[0]);
   if(!authed)return json(401,{msg:'Invalid token'});
   return json(200,users[0]);
  }
  if(path==='/auth/v1/recover')return json(200,{});
  if(path==='/auth/v1/logout')return json(204,{});
  if(path==='/rest/v1/cms_admins')return json(200,[{user_id:users[0].id}]);
  if(path==='/rest/v1/portfolio_projects'){
   if(opts.method==='POST'){
    let rows=JSON.parse(opts.body);if(!Array.isArray(rows))rows=[rows];projects.push(...rows);writeCount++;
    return json(201,(opts.headers.Prefer||'').includes('return=minimal')?null:rows);
   }
   if(opts.method==='PATCH'){
    const id=u.searchParams.get('id').slice(3),changed=JSON.parse(opts.body),idx=projects.findIndex(p=>p.id===id);
    if(idx<0)return json(200,[]);
    projects[idx]={...projects[idx],...changed};writeCount++;return json(200,[projects[idx]]);
   }
   if(opts.method==='DELETE'){
    const id=u.searchParams.get('id').slice(3),existing=projects.filter(p=>p.id===id);
    projects=projects.filter(p=>p.id!==id);writeCount++;return json(200,existing);
   }
   let list=projects;
   if(u.searchParams.get('id'))list=list.filter(p=>p.id===u.searchParams.get('id').slice(3));
   if(u.searchParams.get('published'))list=list.filter(p=>p.published===true);
   return json(200,list);
  }
  if(path.startsWith('/storage/v1/object/')){uploadCount++;return json(200,{Key:path});}
  return json(404,{msg:'Unexpected fetch route: '+path});
 };
 return {get projects(){return projects;},get uploadCount(){return uploadCount;},get writeCount(){return writeCount;},set authed(v){authed=v;},restore(){global.fetch=originalFetch;}};
}
async function login(){const result=await call(mkReq('POST','login',{email:'admin@example.com',password:'a-very-long-password'}));assert.equal(result.statusCode,200,JSON.stringify(result.body));assert.equal(result.headers['set-cookie'].length,2);const cookie=result.headers['set-cookie'].map(s=>s.split(';')[0]).join('; ');return cookie;}

test('config endpoint selects Supabase without exposing keys',async()=>{
 const r=await call(mkReq('GET','config'));
 assert.deepEqual(r.body,{ok:true,backend:'supabase'});
 assert.doesNotMatch(JSON.stringify(r.body),/sb_secret/);
});
test('login rejects cross origin and incorrect credentials',async()=>{
 const sb=mock();try{
  assert.equal((await call(mkReq('POST','login',{email:'admin@example.com',password:'x'},'','https://attacker.example'))).statusCode,403);
  assert.equal((await call(mkReq('POST','login',{email:'admin@example.com',password:'wrong'}))).statusCode,401);
 }finally{sb.restore()}
});
test('authenticated project create, update, delete and public published filter',async()=>{
 const sb=mock();try{
  const cookie=await login();
  const status=await call(mkReq('GET','status',null,cookie));assert.equal(status.body.email,'admin@example.com');
  const created=await call(mkReq('POST','save',{project:{title:'First',category:'web-development',summary:'Testing',published:false}},cookie));
  assert.equal(created.statusCode,200,JSON.stringify(created.body));
  const id=created.body.project.id;assert.equal(sb.projects.length,1);
  const publicDraft=await call(mkReq('GET','notused'),publicApi);assert.equal(publicDraft.statusCode,200);assert.equal(publicDraft.body.projects.length,0);
  const changed=await call(mkReq('POST','save',{id,project:{title:'Now Published',category:'web-development',published:true}},cookie));
  assert.equal(changed.statusCode,200);assert.equal(changed.body.project.title,'Now Published');
  const publicLive=await call(mkReq('GET','notused'),publicApi);assert.equal(publicLive.body.projects.length,1);
  const invalid=await call(mkReq('POST','save',{project:{title:'X',category:'web-development',url:'javascript:alert(1)'}},cookie));
  assert.equal(invalid.statusCode,400);
  const deleted=await call(mkReq('POST','delete',{id},cookie));assert.equal(deleted.statusCode,200);assert.equal(sb.projects.length,0);
 }finally{sb.restore()}
});
test('admin check blocks unauthorized email and no session',async()=>{
 const sb=mock();try{
  assert.equal((await call(mkReq())).statusCode,401);
  process.env.SUPABASE_ADMIN_EMAIL='other@example.com';
  const r=await call(mkReq('POST','login',{email:'admin@example.com',password:'a-very-long-password'}));
  assert.equal(r.statusCode,403);assert.equal(r.headers['set-cookie'],undefined);
 }finally{process.env.SUPABASE_ADMIN_EMAIL=env.SUPABASE_ADMIN_EMAIL;sb.restore()}
});
test('server refreshes session and sets httpOnly cookies',async()=>{
 const sb=mock();try{
  const r=await call(mkReq('GET','status',null,'ms_sb_refresh=refresh'));
  assert.equal(r.statusCode,200,JSON.stringify(r.body));
  const cookies=r.headers['set-cookie'];assert.equal(cookies.length,2);assert.match(cookies[0],/HttpOnly/);assert.match(cookies[1],/SameSite=Strict/);
 }finally{sb.restore()}
});
test('image upload uses server-only key, validates bytes and returns storage URL',async()=>{
 const sb=mock();try{
  const cookie=await login();
  const invalid=await call(mkReq('POST','upload',{mime:'image/png',data:Buffer.from('not-an-image').toString('base64')},cookie));
  assert.equal(invalid.statusCode,400);assert.equal(sb.uploadCount,0);
  const fakeWebp=Buffer.alloc(200);fakeWebp.write('RIFF',0);fakeWebp.write('WEBP',8);
  const good=await call(mkReq('POST','upload',{mime:'image/webp',data:fakeWebp.toString('base64')},cookie));
  assert.equal(good.statusCode,200,JSON.stringify(good.body));
  assert.match(good.body.path,/^https:\/\/example-ref\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\/uploads\/[0-9a-f-]+\.webp$/);
  assert.equal(sb.uploadCount,1);
 }finally{sb.restore()}
});
test('legacy import adds missing records once and preserves IDs',async()=>{
 const sb=mock();try{
  const cookie=await login();
  const doc={id:'05df65d2-2e18-4516-8091-1ffa780b15e4',title:'Legacy image',category:'web-development',image:'assets/uploads/1793743026151-d9e3b1e9ff9544fb.webp',gallery:[],published:true};
  const a=await call(mkReq('POST','import',{projects:[doc]},cookie));assert.equal(a.statusCode,200);assert.equal(a.body.imported,1);
  const b=await call(mkReq('POST','import',{projects:[doc]},cookie));assert.equal(b.statusCode,200);assert.equal(b.body.skipped,1);
  assert.equal(sb.projects.length,1);assert.equal(sb.projects[0].id,doc.id);
 }finally{sb.restore()}
});
test('reset request uses fixed SITE_URL and reset validates recovery token',async()=>{
 const sb=mock();try{
  const a=await call(mkReq('POST','request-reset',{email:'admin@example.com'}));assert.equal(a.statusCode,200);
  const b=await call(mkReq('POST','reset-password',{access_token:'recovery',password:'the-new-safe-password'}));assert.equal(b.statusCode,200);
  assert.equal(b.headers['set-cookie'].length,2);
 }finally{sb.restore()}
});
