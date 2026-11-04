'use strict';
const {test, before, after}=require('node:test');
const assert=require('node:assert/strict');
const initial=require('../content/services.json');
const api=require('../api/admin');
const current=global.fetch;
const original={};
let stored=structuredClone(initial.services);
function res(){return{code:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(n){this.code=n;return this;},json(v){this.data=v;return this;}};}
function request(method,action,body={},cookie=''){return{method,query:{action},body,headers:{host:'portfolio.test',origin:'https://portfolio.test',cookie}};}
function loginCookie(r){return String(r.headers['set-cookie']).split(';')[0];}
before(()=>{
 for(const key of ['GITHUB_OWNER','GITHUB_REPO','GITHUB_TOKEN','ADMIN_PASSWORD','SESSION_SECRET','GITHUB_BRANCH']){original[key]=process.env[key];}
 Object.assign(process.env,{GITHUB_OWNER:'test',GITHUB_REPO:'portfolio',GITHUB_TOKEN:'fake',ADMIN_PASSWORD:'long-enough-test-password',SESSION_SECRET:'s'.repeat(45),GITHUB_BRANCH:'main'});
 global.fetch=async(url,options)=>{
  const path=String(url);assert(path.includes('/content/services.json'));
  if(options.method==='GET')return{ok:true,json:async()=>({sha:'abc123',content:Buffer.from(JSON.stringify({services:stored})).toString('base64')})};
  if(options.method==='PUT'){const input=JSON.parse(options.body);assert.equal(input.sha,'abc123');stored=JSON.parse(Buffer.from(input.content,'base64').toString()).services;return{ok:true,json:async()=>({sha:'abc124'})};}
  throw Error('Unexpected request');
 };
});
after(()=>{global.fetch=current;for(const [k,v] of Object.entries(original)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
test('five services have unique stable routes and fully described content',()=>{
 assert.equal(initial.services.length,5);
 const slugs=initial.services.map(x=>x.slug);assert.equal(new Set(slugs).size,5);
 initial.services.forEach(x=>{assert(x.title&&x.summary&&x.intro&&x.faq.length&&x.benefits.length);});
});
test('services can be edited in authenticated CMS; slugs cannot be modified',async()=>{
 let r=res();await api(request('GET','services'),r);assert.equal(r.code,401);
 r=res();await api(request('POST','login',{password:'long-enough-test-password'}),r);
 const cookie=loginCookie(r);
 r=res();await api(request('GET','services',{},cookie),r);assert.equal(r.data.services.length,5);
 const edited={...stored[0],title:'WordPress & WooCommerce',slug:'changed-slug'};
 r=res();await api(request('POST','saveService',{slug:'wordpress',service:edited},cookie),r);
 assert.equal(r.code,200);assert.equal(stored[0].title,'WordPress & WooCommerce');assert.equal(stored[0].slug,'wordpress');
 const bad=res();await api(request('POST','saveService',{slug:'unknown',service:edited},cookie),bad);assert.equal(bad.code,400);
 const incomplete=res();await api(request('POST','saveService',{slug:'wordpress',service:{...edited,benefits:[]}},cookie),incomplete);assert.equal(incomplete.code,400);
});
