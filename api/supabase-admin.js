'use strict';
const crypto=require('node:crypto');
const s=require('../lib/supabase');
const BUCKET=s.BUCKET;
const loginAttempts=new Map(); // best-effort only; configure Vercel Firewall for global rate limits.
const reject=(res,status,msg)=>s.json(res,status,msg);
const isUuid=x=>s.uuid.test(String(x||''));
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','no-referrer');
 const action=String(req.query?.action||'status');
 const method=req.method;
 if(action==='config'&&method==='GET')return res.json({ok:true,backend:'supabase'});
 if(!s.configured())return reject(res,503,'Supabase setup incomplete. Check Vercel environment variables.');
 if(!['GET','POST'].includes(method)){res.setHeader('Allow','GET, POST');return reject(res,405,'Method not allowed.');}
 if(method==='POST'&&!s.sameOrigin(req))return reject(res,403,'Same-origin request required.');
 try{
  if(method==='POST'&&action==='login'){
   const d=s.input(req),email=String(d.email||'').trim().toLowerCase(),pw=String(d.password||'');
   if(!email||!email.includes('@')||pw.length<1||pw.length>512)return reject(res,400,'Enter a valid email and password.');
   const addr=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'').split(',')[0].slice(0,85);
   const entry=loginAttempts.get(addr)||{count:0,end:Date.now()+600000};if(Date.now()>entry.end){entry.count=0;entry.end=Date.now()+600000;}
   if(entry.count>=6)return reject(res,429,'Too many login attempts. Try again later.');
   let auth;
   try{auth=await s.send('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:pw}});}
   catch(e){if(e.status===400||e.status===401||e.status===422){entry.count++;if(loginAttempts.size>1000&&!loginAttempts.has(addr))loginAttempts.delete(loginAttempts.keys().next().value);loginAttempts.set(addr,entry);return reject(res,401,'Incorrect email or password.');}throw e;}
   const user=await s.getUser(auth.access_token);
   if(!await s.isAdmin(user))return reject(res,403,'Account is not authorized as a CMS administrator.');
   loginAttempts.delete(addr);s.attachTokens(req,res,auth);return res.json({ok:true,email:user.email});
  }
  if(method==='POST'&&action==='logout'){
   // Local sign-out revokes browser cookies even if upstream Auth is unreachable.
   const c=(req.headers.cookie||'').match(/(?:^|;\s*)ms_sb_access=([^;]+)/);
   if(c){try{await s.send('/auth/v1/logout',{method:'POST',userToken:decodeURIComponent(c[1])});}catch{}}
   s.clearTokens(req,res);return res.json({ok:true});
  }
  if(method==='POST'&&action==='request-reset'){
   const email=String(s.input(req).email||'').trim().toLowerCase();
   if(!email||!email.includes('@')||email.length>254)return reject(res,400,'Enter a valid email address.');
   // Do not enable unsolicited recovery messages to arbitrary addresses.
   if(email===String(process.env.SUPABASE_ADMIN_EMAIL).trim().toLowerCase()){
    const base=String(process.env.SITE_URL||'');let redirect;
    try{const u=new URL(base);if(u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash)redirect=u.origin+'/admin/reset.html';}catch{}
    if(!redirect)return reject(res,503,'SITE_URL is missing or invalid. Configure it before requesting a password reset.');
    try{await s.send('/auth/v1/recover?redirect_to='+encodeURIComponent(redirect),{method:'POST',body:{email}});}catch(e){if(e.status===429)return reject(res,429,'Please try again later.');throw e;}
   }
   return res.json({ok:true,message:'If this email is authorized, a reset link will be sent.'});
  }
  if(method==='POST'&&action==='reset-password'){
   const d=s.input(req),token=String(d.access_token||''),password=String(d.password||'');
   if(!token||token.length>4096||password.length<12||password.length>512)return reject(res,400,'Valid recovery link and password of at least 12 characters are required.');
   const user=await s.getUser(token);if(!await s.isAdmin(user))return reject(res,403,'Not an authorized administrator.');
   await s.send('/auth/v1/user',{method:'PUT',userToken:token,body:{password}});
   s.clearTokens(req,res);return res.json({ok:true,message:'Password updated. Sign in with your new password.'});
  }
  const session=await s.signedIn(req,res);
  if(action==='status'&&method==='GET')return res.json({ok:true,authenticated:true,email:session.user.email,backend:'supabase'});
  if(action==='projects'&&method==='GET')return res.json({ok:true,projects:await s.rows(true,'order=featured.desc,created_at.desc')});
  if(action==='save'&&method==='POST'){
   const d=s.input(req),id=String(d.id||'');let old=null;
   if(id){if(!isUuid(id))return reject(res,400,'Invalid project ID.');const existing=await s.tableGet('portfolio_projects','id=eq.'+encodeURIComponent(id));if(!existing.length)return reject(res,404,'Project not found.');old=s.fromDb(existing[0]);}
   const payload=s.cleanProject(d.project,old);
   const path=old?'/rest/v1/portfolio_projects?id=eq.'+encodeURIComponent(id):'/rest/v1/portfolio_projects';
   const body=old?Object.fromEntries(Object.entries(payload).filter(([k])=>!['id','created_at'].includes(k))):payload;
   const result=await s.send(path,{method:old?'PATCH':'POST',key:s.secretKey(),body:old?body:[body],headers:{Prefer:'return=representation'}});
   if(!Array.isArray(result)||!result.length)throw s.error('Project not saved. Please retry.',502);
   return res.json({ok:true,project:s.fromDb(result[0]),message:'Project saved to Supabase. Changes appear on the live site without a redeploy.'});
  }
  if(action==='delete'&&method==='POST'){
   const id=String(s.input(req).id||'');if(!isUuid(id))return reject(res,400,'Invalid project ID.');
   const removed=await s.send('/rest/v1/portfolio_projects?id=eq.'+encodeURIComponent(id),{method:'DELETE',key:s.secretKey(),headers:{Prefer:'return=representation'}});
   if(!Array.isArray(removed)||!removed.length)return reject(res,404,'Project not found.');
   return res.json({ok:true});
  }
  if(action==='upload'&&method==='POST'){
   const d=s.input(req),mime=String(d.mime||''),b64=typeof d.data==='string'?d.data:'';
   if(b64.length>2_800_000)return reject(res,413,'Image is too large (maximum 2 MB).');
   if(!['image/webp','image/png','image/jpeg'].includes(mime)||!b64||!/^[A-Za-z0-9+/]+={0,2}$/.test(b64))return reject(res,400,'Invalid image data.');
   const bytes=Buffer.from(b64,'base64');if(bytes.length<150||bytes.length>2_000_000)return reject(res,400,'Image must be smaller than 2 MB.');
   const valid=mime==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==='image/jpeg'?(bytes[0]===255&&bytes[1]===216&&bytes[2]===255):bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
   if(!valid)return reject(res,400,'File bytes do not match their image type.');
   const ext={'image/webp':'webp','image/png':'png','image/jpeg':'jpg'}[mime];
   const name='uploads/'+crypto.randomUUID()+'.'+ext;
   await s.send('/storage/v1/object/'+BUCKET+'/'+name,{method:'POST',key:s.secretKey(),body:bytes,raw:true,headers:{'Content-Type':mime,'x-upsert':'false'}});
   return res.json({ok:true,path:s.sbUrl()+'/storage/v1/object/public/'+BUCKET+'/'+name,message:'Image uploaded to Supabase Storage.'});
  }
  if(action==='import'&&method==='POST'){
   const data=s.input(req).projects;
   if(!Array.isArray(data)||data.length>150)return reject(res,400,'Provide up to 150 legacy projects.');
   const records=data.map(s.legacyToDb);
   if(new Set(records.map(x=>x.id)).size!==records.length)return reject(res,400,'Duplicate project IDs in import.');
   const current=await s.tableGet('portfolio_projects','');const ids=new Set(current.map(x=>x.id));
   const fresh=records.filter(x=>!ids.has(x.id));
   if(current.length+fresh.length>150)return reject(res,400,'CMS supports a maximum of 150 projects.');
   if(fresh.length)await s.send('/rest/v1/portfolio_projects',{method:'POST',key:s.secretKey(),body:fresh,headers:{Prefer:'return=minimal'}});
   return res.json({ok:true,imported:fresh.length,skipped:records.length-fresh.length,message:`Imported ${fresh.length} projects. ${records.length-fresh.length} already existed.`});
  }
  return reject(res,404,'Unknown CMS action.');
 }catch(e){
  console.error('Supabase CMS error:',e.status||500,e.message);
  if(e.status===400||e.status===401||e.status===403||e.status===404||e.status===409||e.status===429)return reject(res,e.status,e.upstream?'Supabase rejected the request. Check the project setup and try again.':e.message);
  if(e.status===409||e.status===422)return reject(res,409,'Conflict while saving the project.');
  return reject(res,502,'Supabase operation failed. Verify the database SQL, bucket and environment settings.');
 }
};
