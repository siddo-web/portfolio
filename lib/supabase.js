'use strict';
/** Server-only Supabase REST/GoTrue helper. Never import this from the browser. */
const crypto = require('node:crypto');
const BUCKET = 'portfolio-media';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEGACY_IMAGE = /^assets\/uploads\/[a-z0-9_.-]+\.(webp|png|jpg)$/i;
const ADMIN_CATEGORIES = new Set(['web-development','web-design','design-brand','app-development','digital-marketing']);

function sbUrl(){
 const value=String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
 try { const url=new URL(value); if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash) return null;return url.origin; }catch{return null;}
}
function publishableKey(){return process.env.SUPABASE_PUBLISHABLE_KEY||'';}
function secretKey(){return process.env.SUPABASE_SECRET_KEY||'';}
function configured(){return Boolean(sbUrl()&&publishableKey().trim()&&secretKey().trim()&&String(process.env.SUPABASE_ADMIN_EMAIL||'').includes('@'));}
function error(message,status=400){const e=new Error(message);e.status=status;return e;}
function headers(key,opts={}){
 const h={apikey:key,Accept:'application/json',...(opts.headers||{})};
 if(opts.userToken)h.Authorization='Bearer '+opts.userToken;
 else if(key.split('.').length===3 && key.startsWith('eyJ'))h.Authorization='Bearer '+key; // older Supabase JWT API keys
 return h;
}
async function send(path,{method='GET',key=publishableKey(),body,headers:additional={},userToken,raw=false}={}){
 const opts={method,headers:headers(key,{headers:additional,userToken}),signal:AbortSignal.timeout(14500)};
 if(body!==undefined){if(Buffer.isBuffer(body)){opts.body=body;}else{opts.body=JSON.stringify(body);opts.headers['Content-Type']='application/json';}}
 let res;
 try{res=await fetch(sbUrl()+path,opts)}catch{throw error('Supabase is temporarily unreachable. Please try again.',502)}
 let output;
 try{output=raw?await res.text():await res.json()}catch{output=null;}
 if(!res.ok){
  const msg=typeof output?.msg==='string'?output.msg:typeof output?.message==='string'?output.message:typeof output?.error_description==='string'?output.error_description:'Supabase request failed';
  // Never return upstream error bodies which may include internal details or keys.
  const e=error(msg,res.status);e.upstream=true;throw e;
 }
 return output;
}
function urlIsManaged(s){
 if(typeof s!=='string'||s.length>1100)return false;
 try{const u=new URL(s),base=new URL(sbUrl());return u.protocol==='https:'&&u.origin===base.origin&&u.pathname.startsWith('/storage/v1/object/public/'+BUCKET+'/uploads/')&&/^\/storage\/v1\/object\/public\/portfolio-media\/uploads\/[0-9a-f-]+\.(webp|png|jpg)$/i.test(u.pathname)&&!u.search&&!u.hash;}catch{return false;}
}
function validImage(s){return typeof s==='string'&&(LEGACY_IMAGE.test(s)||urlIsManaged(s));}
function vstr(value,max=240){return typeof value==='string'?value.trim().slice(0,max):'';}
function cleanProject(x,prev){
 if(!x||typeof x!=='object'||Array.isArray(x))throw error('Project details missing.');
 const title=vstr(x.title,130),category=vstr(x.category,50);
 if(!title||!ADMIN_CATEGORIES.has(category))throw error('Enter a title and valid service category.');
 if(x.gallery!==undefined&&(!Array.isArray(x.gallery)||x.gallery.length>10))throw error('A maximum of 10 gallery images is allowed.');
 let website=vstr(x.url,500);
 if(website){try{const u=new URL(website);if(!['http:','https:'].includes(u.protocol))throw Error();}catch{throw error('Project URL must begin with https:// or http://.')}}
 const newTime=new Date().toISOString();
 return {
  id: prev?.id||crypto.randomUUID(),title,category,year:vstr(x.year,25),tags:vstr(x.tags,220),summary:vstr(x.summary,600),description:vstr(x.description,8000),url:website,
  image:validImage(x.image)?x.image:'',gallery:Array.isArray(x.gallery)?x.gallery.filter(validImage).slice(0,10):[],
  featured:x.featured===true,published:x.published===true,created_at:prev?.createdAt||newTime,updated_at:newTime
 };
}
function legacyToDb(project){
 if(!project||!uuid.test(String(project.id||'')))throw error('Legacy project ID must be a valid UUID.');
 const row=cleanProject(project);
 row.id=project.id;
 for(const [source,dest] of [['createdAt','created_at'],['updatedAt','updated_at']]){
  const value=project[source];if(typeof value==='string'&&!Number.isNaN(Date.parse(value)))row[dest]=new Date(value).toISOString();
 }
 return row;
}
function fromDb(p){return {id:p.id,title:p.title,category:p.category,year:p.year||'',tags:p.tags||'',summary:p.summary||'',description:p.description||'',url:p.url||'',image:p.image||'',gallery:Array.isArray(p.gallery)?p.gallery:[],featured:p.featured===true,published:p.published===true,createdAt:p.created_at,updatedAt:p.updated_at};}
function qs(id){return encodeURIComponent(id);}
async function tableGet(table,filter='',admin=true){
 return send('/rest/v1/'+table+'?'+(filter?filter+'&':'')+'select=*',{key:admin?secretKey():publishableKey()});
}
async function rows(admin=true,filter=''){return (await tableGet('portfolio_projects',filter,admin)).map(fromDb);}
async function getUser(accessToken){return send('/auth/v1/user',{userToken:accessToken});}
async function isAdmin(user){
 if(!user||!uuid.test(user.id)||typeof user.email!=='string'||user.email.toLowerCase()!==String(process.env.SUPABASE_ADMIN_EMAIL).trim().toLowerCase())return false;
 if(!user.email_confirmed_at&&!user.confirmed_at)return false;
 const data=await tableGet('cms_admins','user_id=eq.'+qs(user.id));return data.some(p=>p.user_id===user.id);
}
function cookies(req){const values={};String(req.headers.cookie||'').split(';').forEach(kv=>{const pos=kv.indexOf('=');if(pos>0)values[kv.slice(0,pos).trim()]=kv.slice(pos+1).trim();});return values;}
function setCookie(req,name,value,age){
 const host=String(req.headers.host||'');const local=/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
 return `${name}=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${age}; ${local?'':'Secure; '}Priority=High`;
}
function attachTokens(req,res,session){
 const ttl=Math.max(60,Math.min(Number(session.expires_in)||3600,3600));
 res.setHeader('Set-Cookie',[
  setCookie(req,'ms_sb_access',encodeURIComponent(session.access_token),ttl),
  setCookie(req,'ms_sb_refresh',encodeURIComponent(session.refresh_token),60*60*24*7)
 ]);
}
function clearTokens(req,res){res.setHeader('Set-Cookie',[
 setCookie(req,'ms_sb_access','',0),setCookie(req,'ms_sb_refresh','',0)
]);}
async function signedIn(req,res){
 const c=cookies(req);let access=c.ms_sb_access?decodeURIComponent(c.ms_sb_access):'';
 if(access){try{const user=await getUser(access);if(!await isAdmin(user))throw error('Account is not an authorized admin.',403);return {user,access};}
  catch(e){if(e.status!==401&&e.status!==403)throw e;if(e.status===403)throw e;}
 }
 if(!c.ms_sb_refresh)throw error('Please sign in to the CMS.',401);
 let session;
 try{session=await send('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:decodeURIComponent(c.ms_sb_refresh)}})}
 catch(e){if(e.status===401||e.status===400){clearTokens(req,res);throw error('Session expired. Please sign in again.',401);}throw e;}
 const user=await getUser(session.access_token);
 if(!await isAdmin(user))throw error('Account is not an authorized admin.',403);
 attachTokens(req,res,session);
 return {user,access:session.access_token};
}
function sameOrigin(req){
 const origin=req.headers.origin,host=req.headers.host;if(!origin||!host)return false;
 try{const u=new URL(origin);return u.host.toLowerCase()===host.toLowerCase()&&(u.protocol==='https:'||(/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)&&u.protocol==='http:'));}catch{return false;}
}
function input(req){let d=req.body;if(typeof d==='string'){try{d=JSON.parse(d)}catch{return {}}}return d&&typeof d==='object'&&!Array.isArray(d)?d:{};}
function json(res,status,msg){return res.status(status).json({ok:false,message:msg});}
module.exports={BUCKET,uuid,sbUrl,publishableKey,secretKey,configured,error,send,urlIsManaged,cleanProject,legacyToDb,fromDb,tableGet,rows,getUser,isAdmin,attachTokens,clearTokens,signedIn,sameOrigin,input,json};
